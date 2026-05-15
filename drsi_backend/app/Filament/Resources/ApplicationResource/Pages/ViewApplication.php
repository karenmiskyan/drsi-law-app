<?php

namespace App\Filament\Resources\ApplicationResource\Pages;

use App\Filament\Resources\ApplicationResource;
use App\Filament\Resources\ApplicationResource\RelationManagers\DocumentsRelationManager;
use App\Mail\Stage2UnlockedMail;
use App\Models\Application;
use Barryvdh\DomPDF\Facade\Pdf;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;

class ViewApplication extends ViewRecord
{
    protected static string $resource = ApplicationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Phase 3.4: admin-edit shortcut + audit log viewer
            Actions\EditAction::make()
                ->label('Edit Form Data')
                ->icon('heroicon-o-pencil-square')
                ->color('warning'),

            Actions\Action::make('viewAuditLog')
                ->label('Audit Log')
                ->icon('heroicon-o-clock')
                ->color('gray')
                ->modalHeading('Edit History')
                ->modalContent(function (): \Illuminate\Contracts\View\View {
                    $logs = $this->record->auditLogs()->with('user')->limit(200)->get();
                    return view('filament.audit-log-modal', ['logs' => $logs]);
                })
                ->modalSubmitAction(false)
                ->modalCancelActionLabel('Close'),

            // Mark as Pending I-130 (after admin reviews Stage 1)
            Actions\Action::make('markPendingI130')
                ->label('Mark as Pending I-130')
                ->icon('heroicon-o-clock')
                ->color('info')
                ->visible(fn (): bool => $this->record->status === 'stage1_submitted')
                ->requiresConfirmation()
                ->modalHeading('Mark as Pending I-130?')
                ->modalDescription('This means you have reviewed Stage 1 and are waiting for I-130 approval.')
                ->action(function (): void {
                    $this->record->update(['status' => 'pending_i130']);

                    Notification::make()
                        ->title('Status updated to Pending I-130')
                        ->success()
                        ->send();
                }),

            // Unlock Stage 2 — the key action
            Actions\Action::make('unlockStage2')
                ->label('Unlock Stage 2')
                ->icon('heroicon-o-lock-open')
                ->color('success')
                ->visible(fn (): bool => $this->record->status === 'pending_i130')
                ->requiresConfirmation()
                ->modalHeading('Unlock Stage 2 for this client?')
                ->modalDescription('This will change the status to "Stage 2 Unlocked" and send an email notification to the client asking them to return to the portal to upload documents.')
                ->modalSubmitActionLabel('Yes, unlock Stage 2')
                ->action(function (): void {
                    $this->record->update(['status' => 'stage2_unlocked']);

                    // Send email to client
                    Mail::to($this->record->user->email)
                        ->send(new Stage2UnlockedMail($this->record));

                    Notification::make()
                        ->title('Stage 2 Unlocked!')
                        ->body("Email sent to {$this->record->user->email}")
                        ->success()
                        ->send();
                }),

            // Mark as Completed
            Actions\Action::make('markCompleted')
                ->label('Mark Completed')
                ->icon('heroicon-o-check-circle')
                ->color('primary')
                ->visible(fn (): bool => in_array($this->record->status, ['stage2_submitted', 'stage2_unlocked']))
                ->requiresConfirmation()
                ->action(function (): void {
                    $this->record->update(['status' => 'completed']);

                    Notification::make()
                        ->title('Application marked as completed!')
                        ->success()
                        ->send();
                }),

            // Export Application as PDF
            Actions\Action::make('exportPdf')
                ->label('Export PDF')
                ->icon('heroicon-o-document-arrow-down')
                ->color('warning')
                ->action(function () {
                    $application = $this->record->load(['user', 'documents']);

                    $pdf = Pdf::loadView('pdf.application', [
                        'application' => $application,
                    ]);

                    $petitioner = data_get($application->form_data, 'petitioner.fullName', 'Unknown');
                    $fileName = "DRSI-Application-{$application->id}-{$petitioner}.pdf";

                    return response()->streamDownload(
                        fn () => print($pdf->output()),
                        $fileName,
                    );
                }),

            // Export Application as DOCX
            Actions\Action::make('exportDocx')
                ->label('Export DOCX')
                ->icon('heroicon-o-document-text')
                ->color('gray')
                ->action(function () {
                    $application = $this->record->load(['user', 'documents']);
                    $fd = $application->form_data ?? [];
                    $pet = $fd['petitioner'] ?? [];
                    $ben = $fd['beneficiary'] ?? [];

                    $phpWord = new PhpWord();
                    $phpWord->setDefaultFontName('Arial');
                    $phpWord->setDefaultFontSize(10);

                    // Styles
                    $phpWord->addTitleStyle(1, ['bold' => true, 'size' => 16, 'color' => 'b72b2b'], ['alignment' => Jc::CENTER, 'spaceAfter' => 120]);
                    $phpWord->addTitleStyle(2, ['bold' => true, 'size' => 13, 'color' => 'b72b2b'], ['spaceAfter' => 80, 'spaceBefore' => 200, 'borderBottomSize' => 6, 'borderBottomColor' => 'b72b2b']);
                    $phpWord->addTitleStyle(3, ['bold' => true, 'size' => 11, 'color' => '333333'], ['spaceAfter' => 60, 'spaceBefore' => 120]);

                    $section = $phpWord->addSection(['marginTop' => 800, 'marginBottom' => 800, 'marginLeft' => 900, 'marginRight' => 900]);

                    // Header
                    $section->addTitle('D. R. SKLAR & ASSOCIATES', 1);
                    $section->addText('Family Immigration Petition Questionnaire — Application #' . $application->id, ['size' => 11], ['alignment' => Jc::CENTER]);
                    $section->addText('Client: ' . ($application->user->email ?? '—') . '  |  Status: ' . str_replace('_', ' ', $application->status) . '  |  Generated: ' . now()->format('M d, Y H:i'), ['size' => 9, 'color' => '666666'], ['alignment' => Jc::CENTER, 'spaceAfter' => 200]);

                    // Helper to add a field row to a table
                    $addRow = function ($table, $label, $value) {
                        $val = (is_array($value) || is_object($value)) ? '—' : ($value !== '' && $value !== null ? $value : '—');
                        $row = $table->addRow();
                        $row->addCell(3000, ['bgColor' => 'F5F5F5'])->addText($label, ['bold' => true, 'size' => 9, 'color' => '555555']);
                        $row->addCell(5500)->addText(e((string) $val), ['size' => 10]);
                    };

                    // Step 1
                    $section->addTitle('Step 1: Basic Information', 2);
                    foreach (['Petitioner' => $pet, 'Beneficiary' => $ben] as $roleName => $person) {
                        $section->addTitle($roleName, 3);
                        $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'DDDDDD', 'cellMargin' => 60]);
                        $addRow($table, 'Full Name', $person['fullName'] ?? null);
                        $addRow($table, 'Relationship', $person['relationship'] ?? null);
                        $addRow($table, 'Date of Birth', $person['dateOfBirth'] ?? null);
                        $addRow($table, 'City of Birth', $person['cityOfBirth'] ?? null);
                        $addRow($table, 'Country of Birth', $person['countryOfBirth'] ?? null);
                        $addRow($table, 'Sex', $person['sex'] ?? null);
                        $addRow($table, 'Email', $person['email'] ?? null);
                        $addRow($table, 'Phone', trim(($person['phoneCountryCode'] ?? '') . ' ' . ($person['phoneNumber'] ?? '')) ?: null);
                        $addRow($table, 'SSN', $person['socialSecurityNumber'] ?? null);
                        $addRow($table, 'A-Number', $person['aNumber'] ?? null);
                    }

                    // Step 2
                    $section->addTitle('Step 2: Address History', 2);
                    foreach (['Petitioner' => $fd['petitionerAddress'] ?? [], 'Beneficiary' => $fd['beneficiaryAddress'] ?? []] as $roleName => $addrData) {
                        $cur = $addrData['currentAddress'] ?? [];
                        $section->addTitle("$roleName — Current Address", 3);
                        $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'DDDDDD', 'cellMargin' => 60]);
                        $addRow($table, 'Street', $cur['street'] ?? null);
                        $addRow($table, 'City', $cur['city'] ?? null);
                        $addRow($table, 'State/Country', $cur['stateOrCountry'] ?? null);
                        $addRow($table, 'ZIP', $cur['zip'] ?? null);
                        $addRow($table, 'From Date', $cur['startDate'] ?? null);
                    }

                    // Step 3 - Marital
                    $step3 = $fd['step3Data'] ?? [];
                    $section->addTitle('Step 3: Marital Status', 2);
                    foreach (['Petitioner' => $step3['petitioner'] ?? [], 'Beneficiary' => $step3['beneficiary'] ?? []] as $roleName => $roleData) {
                        $ms = $roleData['maritalStatus'] ?? [];
                        $section->addTitle("$roleName", 3);
                        $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'DDDDDD', 'cellMargin' => 60]);
                        $addRow($table, 'Times Married', $ms['timesMarried'] ?? null);
                        $cm = $ms['currentMarriage'] ?? [];
                        if (!empty($cm) && is_array($cm)) {
                            $addRow($table, 'Marriage Date', $cm['date'] ?? null);
                            $addRow($table, 'Marriage City', $cm['city'] ?? null);
                            $addRow($table, 'Marriage Country', $cm['country'] ?? null);
                            $addRow($table, 'Spouse Name', $cm['spouseName'] ?? null);
                            $addRow($table, 'Spouse DOB', $cm['spouseDateOfBirth'] ?? null);
                        }
                    }

                    // Step 4 - Family
                    $section->addTitle('Step 4: Family', 2);
                    foreach (['Petitioner' => $step3['petitioner'] ?? [], 'Beneficiary' => $step3['beneficiary'] ?? []] as $roleName => $roleData) {
                        foreach (['father', 'mother'] as $parent) {
                            $p = $roleData[$parent] ?? [];
                            if (empty($p)) continue;
                            $section->addTitle("$roleName — " . ucfirst($parent), 3);
                            $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'DDDDDD', 'cellMargin' => 60]);
                            $addRow($table, 'Surnames', $p['surnames'] ?? null);
                            $addRow($table, 'Given Names', $p['givenNames'] ?? null);
                            $addRow($table, 'Date of Birth', $p['dateOfBirth'] ?? null);
                            $addRow($table, 'Country of Birth', $p['countryOfBirth'] ?? null);
                            $isLiving = $p['isLiving'] ?? null;
                            $addRow($table, 'Is Living', $isLiving === true ? 'Yes' : ($isLiving === false ? 'No' : '—'));
                        }
                    }

                    // Step 5 - Employment
                    $step5 = $fd['step5Data'] ?? [];
                    $section->addTitle('Step 5: Employment & Education', 2);
                    foreach (['Petitioner' => $step5['petitioner'] ?? [], 'Beneficiary' => $step5['beneficiary'] ?? []] as $roleName => $emp) {
                        $section->addTitle("$roleName", 3);
                        $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'DDDDDD', 'cellMargin' => 60]);
                        $addRow($table, 'Employment Status', $emp['currentEmploymentStatus'] ?? null);
                        if ($roleName === 'Petitioner') {
                            $addRow($table, 'Salary', $emp['petitionerSalary'] ?? null);
                        } else {
                            $addRow($table, 'Salary', $emp['beneficiarySalary'] ?? null);
                        }
                        $jobs = $emp['employments'] ?? [];
                        foreach ($jobs as $i => $job) {
                            $addRow($table, 'Job ' . ($i + 1), ($job['position'] ?? '') . ' at ' . ($job['employerName'] ?? ''));
                        }
                    }

                    // Step 6 - Other Info
                    $step6 = $fd['step6Data'] ?? [];
                    $section->addTitle('Step 6: Other Information', 2);
                    foreach (['Petitioner' => $step6['petitioner'] ?? [], 'Beneficiary' => $step6['beneficiary'] ?? []] as $roleName => $info) {
                        $section->addTitle("$roleName", 3);
                        $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'DDDDDD', 'cellMargin' => 60]);
                        $nats = $info['nationalities'] ?? [];
                        if (!empty($nats) && is_array($nats)) {
                            $addRow($table, 'Nationalities', collect($nats)->pluck('nationality')->filter()->implode(', '));
                        }
                        $addRow($table, 'Eye Color', $info['eyeColor'] ?? null);
                        $addRow($table, 'Hair Color', $info['hairColor'] ?? null);
                        $addRow($table, 'Height', ($info['heightFeet'] ?? '') . "'" . ($info['heightInches'] ?? '') . '"');
                        $addRow($table, 'Weight (lbs)', $info['weightLbs'] ?? null);
                    }

                    // Step 7 - Security
                    $step7 = $fd['step7Data'] ?? [];
                    $answers = $step7['securityAnswers'] ?? [];
                    if (!empty($answers)) {
                        $section->addTitle('Step 7: Security & Background', 2);
                        $table = $section->addTable(['borderSize' => 4, 'borderColor' => 'DDDDDD', 'cellMargin' => 60]);
                        $headerRow = $table->addRow();
                        $headerRow->addCell(1500, ['bgColor' => 'F5F5F5'])->addText('#', ['bold' => true, 'size' => 9]);
                        $headerRow->addCell(2000, ['bgColor' => 'F5F5F5'])->addText('Answer', ['bold' => true, 'size' => 9]);
                        $headerRow->addCell(5000, ['bgColor' => 'F5F5F5'])->addText('Explanation', ['bold' => true, 'size' => 9]);
                        foreach ($answers as $i => $ans) {
                            $ansVal = $ans['answer'] ?? null;
                            $ansText = ($ansVal === true) ? 'Yes' : (($ansVal === false) ? 'No' : '—');
                            $row = $table->addRow();
                            $row->addCell(1500)->addText('Q' . ($i + 1), ['size' => 9]);
                            $row->addCell(2000)->addText($ansText, ['size' => 9, 'bold' => $ansVal === true, 'color' => $ansVal === true ? 'b72b2b' : '000000']);
                            $row->addCell(5000)->addText(e((string) ($ans['explanation'] ?? '—')), ['size' => 9]);
                        }
                    }

                    // Footer
                    $section->addTextBreak(1);
                    $section->addText('DRSI Law — D. R. Sklar & Associates Immigration Law Offices | Confidential | Generated ' . now()->format('M d, Y H:i'), ['size' => 8, 'color' => '999999', 'italic' => true], ['alignment' => Jc::CENTER]);

                    $petName = data_get($fd, 'petitioner.fullName', 'Unknown');
                    $fileName = "DRSI-Application-{$application->id}-{$petName}.docx";
                    $tempPath = storage_path("app/private/temp/{$fileName}");

                    if (!is_dir(dirname($tempPath))) {
                        mkdir(dirname($tempPath), 0755, true);
                    }

                    $writer = IOFactory::createWriter($phpWord, 'Word2007');
                    $writer->save($tempPath);

                    return response()->download($tempPath)->deleteFileAfterSend(true);
                }),

            // Download all documents as ZIP
            Actions\Action::make('downloadDocuments')
                ->label('Download All Docs')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('gray')
                ->visible(fn (): bool => $this->record->documents()->exists())
                ->action(function () {
                    $documents = $this->record->documents;
                    if ($documents->isEmpty()) {
                        Notification::make()->title('No documents found')->warning()->send();
                        return;
                    }

                    $zipName = "application-{$this->record->id}-documents.zip";
                    $zipPath = storage_path("app/private/temp/{$zipName}");

                    if (! is_dir(dirname($zipPath))) {
                        mkdir(dirname($zipPath), 0755, true);
                    }

                    $zip = new \ZipArchive();
                    $zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

                    foreach ($documents as $doc) {
                        $fullPath = storage_path("app/private/{$doc->file_path}");
                        if (file_exists($fullPath)) {
                            $zip->addFile($fullPath, $doc->original_name ?? basename($doc->file_path));
                        }
                    }

                    $zip->close();

                    return response()->download($zipPath)->deleteFileAfterSend(true);
                }),

            // Delete Application + User (destructive)
            Actions\Action::make('deleteApplicationAndUser')
                ->label('Delete Application & User')
                ->icon('heroicon-o-trash')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Permanently Delete Application & User?')
                ->modalDescription('This will permanently delete the application, all uploaded documents, and the client user account. This action CANNOT be undone.')
                ->modalSubmitActionLabel('Yes, delete everything')
                ->action(function (): void {
                    $application = $this->record;
                    $user = $application->user;
                    $clientEmail = $user?->email ?? 'unknown';

                    // Delete uploaded document files from disk
                    foreach ($application->documents as $doc) {
                        Storage::disk('local')->delete($doc->file_path);
                    }

                    // Delete the user — cascades to application + documents via FK
                    if ($user) {
                        $user->delete();
                    } else {
                        $application->delete();
                    }

                    Notification::make()
                        ->title('Deleted')
                        ->body("Application #{$application->id} and user {$clientEmail} have been permanently removed.")
                        ->success()
                        ->send();

                    $this->redirect(ApplicationResource::getUrl('index'));
                }),
        ];
    }

    public function getRelationManagers(): array
    {
        return [
            DocumentsRelationManager::class,
        ];
    }
}

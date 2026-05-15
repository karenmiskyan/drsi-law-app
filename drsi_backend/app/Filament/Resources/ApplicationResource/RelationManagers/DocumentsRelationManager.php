<?php

namespace App\Filament\Resources\ApplicationResource\RelationManagers;

use App\Mail\DocumentRejectedMail;
use App\Models\Document;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DocumentsRelationManager extends RelationManager
{
    protected static string $relationship = 'documents';

    protected static ?string $title = 'Document Vault';

    protected static ?string $icon = 'heroicon-o-document-arrow-up';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('document_type')
                    ->label('Type')
                    ->searchable()
                    ->sortable()
                    ->formatStateUsing(fn (string $state): string => str_replace('-', ' ', ucwords($state, '-'))),

                Tables\Columns\TextColumn::make('original_name')
                    ->label('File')
                    ->limit(30)
                    ->tooltip(fn (Document $record): string => $record->original_name),

                Tables\Columns\BadgeColumn::make('document_status')
                    ->label('Status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'approved',
                        'danger' => 'rejected',
                    ]),

                Tables\Columns\IconColumn::make('needs_translation')
                    ->label('Translation')
                    ->boolean()
                    ->trueIcon('heroicon-o-language')
                    ->falseIcon('heroicon-o-minus')
                    ->trueColor('info')
                    ->falseColor('gray'),

                Tables\Columns\TextColumn::make('admin_comment')
                    ->label('Comment')
                    ->limit(40)
                    ->placeholder('—')
                    ->tooltip(fn (Document $record): ?string => $record->admin_comment),

                Tables\Columns\TextColumn::make('size')
                    ->label('Size')
                    ->formatStateUsing(fn (int $state): string => number_format($state / 1024, 0) . ' KB'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Uploaded')
                    ->dateTime('M d, Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                // Approve
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Document $record): bool => $record->document_status !== 'approved')
                    ->requiresConfirmation()
                    ->action(function (Document $record): void {
                        $record->update([
                            'document_status' => 'approved',
                        ]);
                        Notification::make()
                            ->title('Document approved')
                            ->success()
                            ->send();
                    }),

                // Reject with comment
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (Document $record): bool => $record->document_status !== 'rejected')
                    ->form([
                        Forms\Components\Textarea::make('admin_comment')
                            ->label('Reason for rejection (visible to client)')
                            ->required()
                            ->maxLength(500)
                            ->placeholder('e.g. Document is blurry, please re-upload a clearer copy.')
                            ->default(fn (Document $record): ?string => $record->admin_comment),
                    ])
                    ->action(function (Document $record, array $data): void {
                        $record->update([
                            'document_status' => 'rejected',
                            'admin_comment' => $data['admin_comment'],
                        ]);

                        // Notify the client about the rejection (with defensive error handling + logging so
                        // silent SMTP failures become visible in laravel.log — Meir reported an undelivered email)
                        $application = $record->application;
                        $user = $application->user;
                        $emailSent = false;
                        $emailError = null;
                        try {
                            Mail::to($user->email)->send(new DocumentRejectedMail(
                                $application,
                                $record->document_type,
                                $data['admin_comment'],
                            ));
                            $emailSent = true;
                            Log::info('DocumentRejectedMail dispatched', [
                                'application_id' => $application->id,
                                'recipient' => $user->email,
                                'document_type' => $record->document_type,
                            ]);
                        } catch (\Throwable $e) {
                            $emailError = $e->getMessage();
                            Log::error('DocumentRejectedMail failed to send', [
                                'application_id' => $application->id,
                                'recipient' => $user->email,
                                'error' => $emailError,
                            ]);
                        }

                        if ($emailSent) {
                            Notification::make()
                                ->title('Document rejected')
                                ->body("Email sent to {$user->email}.")
                                ->warning()
                                ->send();
                        } else {
                            Notification::make()
                                ->title('Document rejected — EMAIL FAILED')
                                ->body("Status saved but email to {$user->email} failed: {$emailError}")
                                ->danger()
                                ->persistent()
                                ->send();
                        }
                    }),

                // Add / Edit Comment
                Tables\Actions\Action::make('comment')
                    ->label('Comment')
                    ->icon('heroicon-o-chat-bubble-left-ellipsis')
                    ->color('gray')
                    ->form([
                        Forms\Components\Textarea::make('admin_comment')
                            ->label('Admin Comment')
                            ->maxLength(500)
                            ->default(fn (Document $record): ?string => $record->admin_comment),
                    ])
                    ->action(function (Document $record, array $data): void {
                        $record->update([
                            'admin_comment' => $data['admin_comment'],
                        ]);
                        Notification::make()
                            ->title('Comment saved')
                            ->success()
                            ->send();
                    }),

                // View (inline preview in new tab) — Phase 3.2
                Tables\Actions\Action::make('view')
                    ->label('View')
                    ->icon('heroicon-o-eye')
                    ->color('info')
                    ->url(fn (Document $record) => route('admin.doc.view', ['id' => $record->id]))
                    ->openUrlInNewTab(),

                // Download
                Tables\Actions\Action::make('download')
                    ->label('Download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('gray')
                    ->action(function (Document $record) {
                        $fullPath = storage_path("app/private/{$record->file_path}");
                        if (file_exists($fullPath)) {
                            return response()->download($fullPath, $record->original_name);
                        }
                        Notification::make()
                            ->title('File not found on disk')
                            ->danger()
                            ->send();
                    }),
            ])
            ->emptyStateHeading('No documents uploaded')
            ->emptyStateDescription('Documents will appear here after the client uploads them.')
            ->emptyStateIcon('heroicon-o-document');
    }
}

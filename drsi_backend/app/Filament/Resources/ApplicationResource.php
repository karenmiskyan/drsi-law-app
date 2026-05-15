<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ApplicationResource\Pages;
use App\Filament\Resources\ApplicationResource\RelationManagers;
use App\Models\Application;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\Grid;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ApplicationResource extends Resource
{
    protected static ?string $model = Application::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationLabel = 'Applications';

    protected static ?string $modelLabel = 'Application';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('#')
                    ->sortable(),

                Tables\Columns\TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('petitioner_name')
                    ->label('Petitioner')
                    ->getStateUsing(fn (Application $record): string => self::getNameFromJson($record, 'petitioner'))
                    ->searchable(query: function ($query, string $search): void {
                        $query->where('form_data->petitioner->fullName', 'like', "%{$search}%");
                    }),

                Tables\Columns\TextColumn::make('beneficiary_name')
                    ->label('Beneficiary')
                    ->getStateUsing(fn (Application $record): string => self::getNameFromJson($record, 'beneficiary')),

                Tables\Columns\BadgeColumn::make('status')
                    ->color(fn (string $state): string => match ($state) {
                        'draft' => 'gray',
                        'stage1_submitted' => 'warning',
                        'pending_i130' => 'info',
                        'stage2_unlocked' => 'success',
                        'stage2_submitted' => 'warning',
                        'completed' => 'primary',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'draft' => 'Draft',
                        'stage1_submitted' => 'Stage 1 Submitted',
                        'pending_i130' => 'Pending I-130',
                        'stage2_unlocked' => 'Stage 2 Unlocked',
                        'stage2_submitted' => 'Stage 2 Submitted',
                        'completed' => 'Completed',
                        default => $state,
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('stage1_submitted_at')
                    ->label('Submitted')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('updated_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'stage1_submitted' => 'Stage 1 Submitted',
                        'pending_i130' => 'Pending I-130',
                        'stage2_unlocked' => 'Stage 2 Unlocked',
                        'stage2_submitted' => 'Stage 2 Submitted',
                        'completed' => 'Completed',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                // ── Status Overview ──
                Section::make('Application Status')
                    ->icon('heroicon-o-information-circle')
                    ->schema([
                        Grid::make(3)->schema([
                            TextEntry::make('status')
                                ->badge()
                                ->color(fn (string $state): string => match ($state) {
                                    'draft' => 'gray',
                                    'stage1_submitted' => 'warning',
                                    'pending_i130' => 'info',
                                    'stage2_unlocked' => 'success',
                                    'stage2_submitted' => 'warning',
                                    'completed' => 'primary',
                                    default => 'gray',
                                })
                                ->formatStateUsing(fn (string $state): string => match ($state) {
                                    'draft' => 'Draft',
                                    'stage1_submitted' => 'Stage 1 Submitted',
                                    'pending_i130' => 'Pending I-130',
                                    'stage2_unlocked' => 'Stage 2 Unlocked',
                                    'stage2_submitted' => 'Stage 2 Submitted',
                                    'completed' => 'Completed',
                                    default => $state,
                                }),
                            TextEntry::make('user.email')->label('Client Email'),
                            TextEntry::make('stage1_submitted_at')->label('Submitted At')->dateTime('M d, Y H:i')->placeholder('—'),
                        ]),
                    ]),

                // ── Step 1: Basic Info (frontend: fullName, relationship, phoneCountryCode+phoneNumber, socialSecurityNumber) ──
                Section::make('Step 1: Basic Information')
                    ->icon('heroicon-o-user')
                    ->collapsed()
                    ->schema([
                        Grid::make(2)->schema([
                            Section::make('Petitioner (US Citizen)')->schema([
                                Grid::make(2)->schema([
                                    TextEntry::make('form_data.petitioner.fullName')->label('Full Name')->placeholder('—'),
                                    TextEntry::make('form_data.petitioner.relationship')->label('Relationship')->placeholder('—'),
                                    TextEntry::make('form_data.petitioner_phone')->label('Phone')->getStateUsing(fn (Application $record): string => self::formatPhone($record, 'petitioner'))->placeholder('—'),
                                    TextEntry::make('form_data.petitioner.email')->label('Email')->placeholder('—'),
                                    TextEntry::make('form_data.petitioner.dateOfBirth')->label('Date of Birth')->placeholder('—'),
                                    TextEntry::make('form_data.petitioner.cityOfBirth')->label('City of Birth')->placeholder('—'),
                                    TextEntry::make('form_data.petitioner.countryOfBirth')->label('Country of Birth')->placeholder('—'),
                                    TextEntry::make('form_data.petitioner.socialSecurityNumber')->label('SSN')->placeholder('—'),
                                    TextEntry::make('form_data.petitioner.aNumber')->label('A-Number')->placeholder('—'),
                                ]),
                            ]),
                            Section::make('Beneficiary (Applicant)')->schema([
                                Grid::make(2)->schema([
                                    TextEntry::make('form_data.beneficiary.fullName')->label('Full Name')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary.relationship')->label('Relationship')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary_phone')->label('Phone')->getStateUsing(fn (Application $record): string => self::formatPhone($record, 'beneficiary'))->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary.email')->label('Email')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary.dateOfBirth')->label('Date of Birth')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary.cityOfBirth')->label('City of Birth')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary.countryOfBirth')->label('Country of Birth')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary.socialSecurityNumber')->label('SSN')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiary.aNumber')->label('A-Number')->placeholder('—'),
                                ]),
                            ]),
                        ]),
                    ]),

                // ── Step 2: Address History (frontend: petitionerAddress/beneficiaryAddress with currentAddress, previousAddresses, livedInOtherCountry*) ──
                Section::make('Step 2: Address History')
                    ->icon('heroicon-o-home')
                    ->collapsed()
                    ->schema([
                        Grid::make(2)->schema([
                            Section::make('Petitioner Current Address')->schema([
                                Grid::make(2)->schema([
                                    TextEntry::make('form_data.petitionerAddress.currentAddress.street')->label('Street')->placeholder('—'),
                                    TextEntry::make('form_data.petitionerAddress.currentAddress.floorAptSuite')->label('Floor/Apt/Suite')->placeholder('—'),
                                    TextEntry::make('form_data.petitionerAddress.currentAddress.city')->label('City')->placeholder('—'),
                                    TextEntry::make('form_data.petitionerAddress.currentAddress.zip')->label('ZIP')->placeholder('—'),
                                    TextEntry::make('form_data.petitionerAddress.currentAddress.stateOrCountry')->label('State/Country')->placeholder('—'),
                                    TextEntry::make('form_data.petitionerAddress.currentAddress.startDate')->label('Since')->placeholder('—'),
                                ]),
                            ]),
                            Section::make('Beneficiary Current Address')->schema([
                                Grid::make(2)->schema([
                                    TextEntry::make('form_data.beneficiaryAddress.currentAddress.street')->label('Street')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiaryAddress.currentAddress.floorAptSuite')->label('Floor/Apt/Suite')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiaryAddress.currentAddress.city')->label('City')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiaryAddress.currentAddress.zip')->label('ZIP')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiaryAddress.currentAddress.stateOrCountry')->label('State/Country')->placeholder('—'),
                                    TextEntry::make('form_data.beneficiaryAddress.currentAddress.startDate')->label('Since')->placeholder('—'),
                                ]),
                            ]),
                        ]),
                        Grid::make(2)->schema([
                            TextEntry::make('petitioner_previous_addresses')
                                ->label('Petitioner Previous Addresses (Last 5 Years)')
                                ->getStateUsing(fn (Application $record): string => self::formatPreviousAddresses($record, 'petitionerAddress'))
                                ->html()
                                ->placeholder('None'),
                            TextEntry::make('beneficiary_previous_addresses')
                                ->label('Beneficiary Previous Addresses (Since Age 16)')
                                ->getStateUsing(fn (Application $record): string => self::formatPreviousAddresses($record, 'beneficiaryAddress'))
                                ->html()
                                ->placeholder('None'),
                        ]),
                        Section::make('Future US Address')->schema([
                            Grid::make(3)->schema([
                                TextEntry::make('form_data.futureUSAddress.nameOfPersonLiving')->label('Name at Address')->placeholder('—'),
                                TextEntry::make('form_data.futureUSAddress.address')->label('Street')->placeholder('—'),
                                TextEntry::make('form_data.futureUSAddress.floorAptSuite')->label('Floor/Apt/Suite')->placeholder('—'),
                                TextEntry::make('form_data.futureUSAddress.city')->label('City')->placeholder('—'),
                                TextEntry::make('form_data.futureUSAddress.state')->label('State')->placeholder('—'),
                                TextEntry::make('form_data.futureUSAddress.zipCode')->label('ZIP')->placeholder('—'),
                                TextEntry::make('form_data.future_us_phone')->label('Phone')->getStateUsing(fn (Application $record): string => self::formatFutureUSPhone($record))->placeholder('—'),
                                TextEntry::make('form_data.futureUSAddress.isGreenCardDeliveryAddress')->label('Green Card Delivery Here')->getStateUsing(fn (Application $record): string => self::formatBooleanField($record, 'futureUSAddress.isGreenCardDeliveryAddress'))->placeholder('—'),
                            ]),
                            TextEntry::make('future_us_contact_address')
                                ->label('Contact Address (if Green Card not delivered here)')
                                ->getStateUsing(fn (Application $record): string => self::formatFutureUSContactAddress($record))
                                ->html()
                                ->placeholder('—'),
                        ]),
                        Grid::make(2)->schema([
                            TextEntry::make('petitioner_lived_elsewhere')
                                ->label('Lived Elsewhere >6 Months (Petitioner)')
                                ->getStateUsing(fn (Application $record): string => self::formatLivedElsewhere($record, 'petitionerAddress'))
                                ->html()
                                ->placeholder('—'),
                            TextEntry::make('beneficiary_lived_elsewhere')
                                ->label('Lived Elsewhere >6 Months (Beneficiary)')
                                ->getStateUsing(fn (Application $record): string => self::formatLivedElsewhere($record, 'beneficiaryAddress'))
                                ->html()
                                ->placeholder('—'),
                        ]),
                    ]),

                // ── Step 3: Marital Status (frontend: step3Data.petitioner.beneficiary.maritalStatus) ──
                Section::make('Step 3: Marital Status')
                    ->icon('heroicon-o-heart')
                    ->collapsed()
                    ->schema([
                        Grid::make(2)->schema([
                            Section::make('Petitioner')->schema([
                                TextEntry::make('form_data.step3Data.petitioner.maritalStatus.timesMarried')->label('Times Married')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.maritalStatus.currentMarriage.spouseName')->label('Current Spouse Name')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.maritalStatus.currentMarriage.date')->label('Marriage Date')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.maritalStatus.currentMarriage.city')->label('Marriage City')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.maritalStatus.currentMarriage.country')->label('Marriage Country')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.maritalStatus.currentMarriage.spouseDateOfBirth')->label('Spouse DOB')->placeholder('—'),
                                TextEntry::make('petitioner_prior_marriages')
                                    ->label('Prior Marriages')
                                    ->getStateUsing(fn (Application $record): string => self::formatPriorMarriages($record, 'petitioner'))
                                    ->html()
                                    ->placeholder('None'),
                            ]),
                            Section::make('Beneficiary')->schema([
                                TextEntry::make('form_data.step3Data.beneficiary.maritalStatus.timesMarried')->label('Times Married')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.maritalStatus.currentMarriage.spouseName')->label('Current Spouse Name')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.maritalStatus.currentMarriage.date')->label('Marriage Date')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.maritalStatus.currentMarriage.city')->label('Marriage City')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.maritalStatus.currentMarriage.country')->label('Marriage Country')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.maritalStatus.currentMarriage.spouseDateOfBirth')->label('Spouse DOB')->placeholder('—'),
                                TextEntry::make('beneficiary_prior_marriages')
                                    ->label('Prior Marriages')
                                    ->getStateUsing(fn (Application $record): string => self::formatPriorMarriages($record, 'beneficiary'))
                                    ->html()
                                    ->placeholder('None'),
                            ]),
                        ]),
                    ]),

                // ── Step 4: Family (frontend: step3Data.petitioner/beneficiary.father/mother — surnames, givenNames, isLiving) ──
                Section::make('Step 4: Family (Parents & Children)')
                    ->icon('heroicon-o-user-group')
                    ->collapsed()
                    ->schema([
                        Grid::make(2)->schema([
                            Section::make('Petitioner Father')->schema([
                                TextEntry::make('form_data.step3Data.petitioner.father.surnames')->label('Surnames')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.father.givenNames')->label('Given Names')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.father.dateOfBirth')->label('Date of Birth')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.father.isLiving')->label('Is Living')->getStateUsing(fn (Application $record): string => self::formatBooleanField($record, 'step3Data.petitioner.father.isLiving'))->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.father.currentCity')->label('Current City')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.father.currentCountry')->label('Current Country')->placeholder('—'),
                            ]),
                            Section::make('Petitioner Mother')->schema([
                                TextEntry::make('form_data.step3Data.petitioner.mother.surnames')->label('Surnames')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.mother.givenNames')->label('Given Names')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.mother.dateOfBirth')->label('Date of Birth')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.mother.isLiving')->label('Is Living')->getStateUsing(fn (Application $record): string => self::formatBooleanField($record, 'step3Data.petitioner.mother.isLiving'))->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.mother.currentCity')->label('Current City')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.petitioner.mother.currentCountry')->label('Current Country')->placeholder('—'),
                            ]),
                        ]),
                        Grid::make(2)->schema([
                            Section::make('Beneficiary Father')->schema([
                                TextEntry::make('form_data.step3Data.beneficiary.father.surnames')->label('Surnames')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.father.givenNames')->label('Given Names')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.father.dateOfBirth')->label('Date of Birth')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.father.isLiving')->label('Is Living')->getStateUsing(fn (Application $record): string => self::formatBooleanField($record, 'step3Data.beneficiary.father.isLiving'))->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.father.fullCurrentAddress')->label('Full Current Address')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.father.yearOfDeath')->label('Year of Death')->placeholder('—'),
                            ]),
                            Section::make('Beneficiary Mother')->schema([
                                TextEntry::make('form_data.step3Data.beneficiary.mother.surnames')->label('Surnames')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.mother.surnamesAtBirth')->label('Surnames at Birth')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.mother.givenNames')->label('Given Names')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.mother.dateOfBirth')->label('Date of Birth')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.mother.isLiving')->label('Is Living')->getStateUsing(fn (Application $record): string => self::formatBooleanField($record, 'step3Data.beneficiary.mother.isLiving'))->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.mother.fullCurrentAddress')->label('Full Current Address')->placeholder('—'),
                                TextEntry::make('form_data.step3Data.beneficiary.mother.yearOfDeath')->label('Year of Death')->placeholder('—'),
                            ]),
                        ]),
                        Grid::make(2)->schema([
                            TextEntry::make('form_data.step3Data.petitioner.numberOfDependentChildren')->label('Petitioner Dependent Children')->placeholder('0'),
                            TextEntry::make('form_data.step3Data.beneficiary.numberOfAllChildren')->label('Beneficiary Total Children')->placeholder('0'),
                        ]),
                        TextEntry::make('form_data.beneficiary_children')
                            ->label('Beneficiary Children Details')
                            ->getStateUsing(fn (Application $record): string => self::formatBeneficiaryChildren($record))
                            ->html()
                            ->placeholder('None'),
                    ]),

                // ── Step 5: Employment ──
                Section::make('Step 5: Employment & Education')
                    ->icon('heroicon-o-briefcase')
                    ->collapsed()
                    ->schema([
                        TextEntry::make('petitioner_employment_summary')
                            ->label('Petitioner Employment')
                            ->getStateUsing(fn (Application $record): string => self::formatEmployment($record, 'petitioner'))
                            ->html()
                            ->placeholder('No employment data'),
                        TextEntry::make('beneficiary_employment_summary')
                            ->label('Beneficiary Employment')
                            ->getStateUsing(fn (Application $record): string => self::formatEmployment($record, 'beneficiary'))
                            ->html()
                            ->placeholder('No employment data'),
                    ]),

                // ── Step 6: Other Info ──
                Section::make('Step 6: Other Information')
                    ->icon('heroicon-o-globe-alt')
                    ->collapsed()
                    ->schema([
                        Grid::make(2)->schema([
                            Section::make('Petitioner')->schema([
                                TextEntry::make('form_data.step6Data.petitioner.eyeColor')->label('Eye Color')->placeholder('—'),
                                TextEntry::make('form_data.step6Data.petitioner.hairColor')->label('Hair Color')->placeholder('—'),
                                TextEntry::make('form_data.step6Data.petitioner.heightFeet')->label('Height (ft)')->placeholder('—'),
                                TextEntry::make('form_data.step6Data.petitioner.weightPounds')->label('Weight (lbs)')->placeholder('—'),
                                TextEntry::make('form_data.step6Data.petitioner.howBecameUSCitizen')->label('How Became US Citizen')->placeholder('—'),
                                TextEntry::make('form_data.step6_nationalities')->label('Petitioner Nationalities')->getStateUsing(fn (Application $record): string => self::formatNationalities($record, 'petitioner'))->placeholder('—'),
                            ]),
                            Section::make('Beneficiary')->schema([
                                TextEntry::make('form_data.step6Data.beneficiary.eyeColor')->label('Eye Color')->placeholder('—'),
                                TextEntry::make('form_data.step6Data.beneficiary.hairColor')->label('Hair Color')->placeholder('—'),
                                TextEntry::make('form_data.step6Data.beneficiary.heightFeet')->label('Height (ft)')->placeholder('—'),
                                TextEntry::make('form_data.step6Data.beneficiary.weightPounds')->label('Weight (lbs)')->placeholder('—'),
                                TextEntry::make('form_data.step5Data.beneficiary.intendedJobFieldInUS')->label('Intended Job Field in US')->placeholder('—'),
                                TextEntry::make('form_data.step6_nationalities_ben')->label('Beneficiary Nationalities')->getStateUsing(fn (Application $record): string => self::formatNationalities($record, 'beneficiary'))->placeholder('—'),
                            ]),
                        ]),
                    ]),

                // ── Step 7: Security ──
                Section::make('Step 7: Security Background')
                    ->icon('heroicon-o-shield-check')
                    ->collapsed()
                    ->schema([
                        TextEntry::make('security_summary')
                            ->label('Security Answers Summary')
                            ->getStateUsing(function (Application $record): string {
                                $answers = data_get($record->form_data, 'step7Data.securityAnswers', []);
                                if (empty($answers)) return 'No answers provided';

                                $total = count($answers);
                                $yesCount = collect($answers)->filter(fn ($a) => ($a['answer'] ?? null) === true)->count();
                                $noCount = collect($answers)->filter(fn ($a) => ($a['answer'] ?? null) === false)->count();
                                $unanswered = $total - $yesCount - $noCount;

                                $html = "<strong>{$total} questions</strong> — {$yesCount} Yes, {$noCount} No";
                                if ($unanswered > 0) $html .= ", <span style='color:red'>{$unanswered} unanswered</span>";
                                if ($yesCount > 0) $html .= "<br><span style='color:orange'>⚠ {$yesCount} question(s) answered YES — review required</span>";

                                return $html;
                            })
                            ->html(),
                    ]),

                // ── Raw JSON (Debug) ──
                Section::make('Raw Form Data (JSON)')
                    ->icon('heroicon-o-code-bracket')
                    ->collapsed()
                    ->schema([
                        TextEntry::make('form_data_raw')
                            ->label('')
                            ->getStateUsing(fn (Application $record): string => '<pre style="max-height:400px;overflow:auto;font-size:11px">'.e(json_encode($record->form_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)).'</pre>')
                            ->html(),
                    ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\DocumentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListApplications::route('/'),
            'view' => Pages\ViewApplication::route('/{record}'),
            // Phase 3.4: admin can edit client form data (changes recorded in audit log)
            'edit' => Pages\EditApplication::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    /**
     * Phase 3.4: Edit form — lets admin override client answers.
     *
     * For scope, we expose a JSON editor for `form_data` plus the structural fields.
     * A future enhancement could map each nested path to a proper form field, but
     * JSON is both sufficient for now AND fully auditable via the Observer.
     */
    public static function form(\Filament\Forms\Form $form): \Filament\Forms\Form
    {
        return $form->schema([
            \Filament\Forms\Components\Select::make('status')
                ->label('Status')
                ->options([
                    'draft' => 'Draft',
                    'stage1_submitted' => 'Stage 1 Submitted',
                    'pending_i130' => 'Pending I-130',
                    'stage2_unlocked' => 'Stage 2 Unlocked',
                    'stage2_submitted' => 'Stage 2 Submitted',
                    'completed' => 'Completed',
                ])
                ->required(),
            \Filament\Forms\Components\Textarea::make('form_data')
                ->label('Form Data (JSON)')
                ->rows(20)
                ->helperText('Edit this JSON carefully. Every change is logged in the audit trail.')
                ->required()
                ->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) : $state)
                ->dehydrateStateUsing(fn ($state) => is_string($state) ? json_decode($state, true) : $state)
                ->rules([
                    fn (): \Closure => function (string $attribute, $value, \Closure $fail) {
                        if (is_string($value) && json_decode($value, true) === null && $value !== 'null') {
                            $fail('The form data must be valid JSON.');
                        }
                    },
                ]),
        ]);
    }

    // ── Helpers ──

    /** Format a boolean JSON field as Yes/No/— without relying on Filament closure injection. */
    private static function formatBooleanField(Application $record, string $path): string
    {
        $value = data_get($record->form_data, $path);

        return $value === true ? 'Yes' : ($value === false ? 'No' : '—');
    }

    private static function getNameFromJson(Application $record, string $person): string
    {
        $fullName = data_get($record->form_data, "{$person}.fullName", '');

        return is_string($fullName) && trim($fullName) !== '' ? trim($fullName) : '—';
    }

    private static function formatPhone(Application $record, string $person): string
    {
        $cc = data_get($record->form_data, "{$person}.phoneCountryCode", '');
        $num = data_get($record->form_data, "{$person}.phoneNumber", '');

        return trim("{$cc} {$num}") ?: '—';
    }

    private static function formatFutureUSPhone(Application $record): string
    {
        $cc = data_get($record->form_data, 'futureUSAddress.phoneCountryCode', '');
        $num = data_get($record->form_data, 'futureUSAddress.phoneNumber', '');

        return trim("{$cc} {$num}") ?: '—';
    }

    private static function formatPreviousAddresses(Application $record, string $key): string
    {
        $addrs = data_get($record->form_data, "{$key}.previousAddresses", []);
        if (empty($addrs)) return '<em>None</em>';

        $html = '<ul style="list-style:disc;padding-left:16px">';
        foreach ($addrs as $a) {
            $street = e($a['street'] ?? '—');
            $city = e($a['city'] ?? '');
            $zip = e($a['zip'] ?? '');
            $state = e($a['stateOrCountry'] ?? '');
            $from = e($a['startDate'] ?? '');
            $to = e($a['endDate'] ?? '');
            $html .= "<li><strong>{$street}</strong>, {$city} {$zip} {$state} — {$from} to {$to}</li>";
        }
        $html .= '</ul>';

        return $html;
    }

    private static function formatFutureUSContactAddress(Application $record): string
    {
        if (data_get($record->form_data, 'futureUSAddress.isGreenCardDeliveryAddress') === true) {
            return '<em>N/A — Green Card delivered at main address</em>';
        }
        $person = data_get($record->form_data, 'futureUSAddress.contactPerson', '');
        $street = data_get($record->form_data, 'futureUSAddress.contactStreet', '');
        $city = data_get($record->form_data, 'futureUSAddress.contactCity', '');
        $state = data_get($record->form_data, 'futureUSAddress.contactState', '');
        $zip = data_get($record->form_data, 'futureUSAddress.contactZip', '');
        $cc = data_get($record->form_data, 'futureUSAddress.contactPhoneCountryCode', '');
        $phone = data_get($record->form_data, 'futureUSAddress.contactPhone', '');
        $parts = array_filter([$person, trim($street . ' ' . $city . ' ' . $state . ' ' . $zip), trim($cc . ' ' . $phone)]);

        return $parts ? implode(' | ', array_map('e', $parts)) : '—';
    }

    private static function formatLivedElsewhere(Application $record, string $key): string
    {
        $over6 = data_get($record->form_data, "{$key}.livedInOtherCountryOver6Months");
        if ($over6 !== true) {
            return $over6 === false ? 'No' : '—';
        }
        $details = data_get($record->form_data, "{$key}.livedInOtherCountryDetails", []);
        if (empty($details)) return 'Yes (no details provided)';

        $html = 'Yes<ul style="list-style:disc;padding-left:16px;margin-top:4px">';
        foreach ($details as $d) {
            $country = e($d['country'] ?? '—');
            $duration = e($d['duration'] ?? '');
            $html .= "<li>{$country} — {$duration}</li>";
        }
        $html .= '</ul>';

        return $html;
    }

    private static function formatBeneficiaryChildren(Application $record): string
    {
        $children = data_get($record->form_data, 'step3Data.beneficiary.children', []);
        if (empty($children)) return '<em>None</em>';

        $html = '<ul style="list-style:disc;padding-left:16px">';
        foreach ($children as $c) {
            $name = $c['nameSurname'] ?? '—';
            $dob = $c['dateOfBirth'] ?? '';
            $lives = ($c['livesWithYou'] ?? false) ? 'Yes' : 'No';
            $immigrating = ($c['immigratingWithYou'] ?? false) ? 'Yes' : 'No';
            $html .= "<li><strong>{$name}</strong> (DOB: {$dob}) — Lives with you: {$lives}, Immigrating: {$immigrating}</li>";
        }
        $html .= '</ul>';

        return $html;
    }

    private static function formatNationalities(Application $record, string $person): string
    {
        $list = data_get($record->form_data, "step6Data.{$person}.nationalities", []);
        if (empty($list)) return '—';

        $parts = [];
        foreach ($list as $n) {
            $nat = $n['nationality'] ?? '';
            $pp = $n['passportNumber'] ?? '';
            $parts[] = $nat . ($pp ? " (Passport: {$pp})" : '');
        }

        return implode(', ', $parts) ?: '—';
    }

    private static function formatPriorMarriages(Application $record, string $person): string
    {
        $prior = data_get($record->form_data, "step3Data.{$person}.maritalStatus.priorMarriages", []);
        if (empty($prior)) {
            return '<em>None</em>';
        }

        $html = '<ul style="list-style:disc;padding-left:16px">';
        foreach ($prior as $i => $m) {
            $name = $m['fullName'] ?? '—';
            $dob = $m['dateOfBirth'] ?? '';
            $mDate = $m['marriageDate'] ?? '';
            $mCity = $m['marriageCity'] ?? '';
            $mCountry = $m['marriageCountry'] ?? '';
            $dDate = $m['divorceDate'] ?? '';
            $dCity = $m['divorceCity'] ?? '';
            $dCountry = $m['divorceCountry'] ?? '';
            $html .= '<li>';
            $html .= '<strong>' . e($name) . '</strong> (DOB: ' . e($dob) . ')';
            $html .= ' — Marriage: ' . e($mDate) . ' ' . e($mCity) . ' ' . e($mCountry);
            if ($dDate || $dCity || $dCountry) {
                $html .= ' | Divorce: ' . e($dDate) . ' ' . e($dCity) . ' ' . e($dCountry);
            }
            $html .= '</li>';
        }
        $html .= '</ul>';

        return $html;
    }

    private static function formatEmployment(Application $record, string $person): string
    {
        $entries = data_get($record->form_data, "step5Data.{$person}.employments", []);
        if (empty($entries)) return '<em>No entries</em>';

        $html = '<ul style="list-style:disc;padding-left:16px">';
        foreach ($entries as $entry) {
            $position = $entry['position'] ?? 'Unknown';
            $employer = $entry['employerName'] ?? 'Unknown';
            $employerAddr = $entry['employerAddress'] ?? '';
            $from = $entry['fromDate'] ?? '?';
            $to = ($entry['toDate'] ?? '') ?: 'Present';
            $html .= "<li><strong>{$position}</strong> at {$employer}";
            if ($employerAddr) $html .= " — {$employerAddr}";
            $html .= " ({$from} – {$to})</li>";
        }
        $html .= '</ul>';

        return $html;
    }
}

<?php

namespace App\Filament\Resources\ApplicationResource\Pages;

use App\Filament\Resources\ApplicationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

/**
 * Phase 3.4: Admin edit page for applications.
 *
 * Every save passes through the Application model's `updating` event, which is
 * observed by ApplicationObserver — the observer diffs form_data and writes one
 * row per changed field into application_audit_log.
 */
class EditApplication extends EditRecord
{
    protected static string $resource = ApplicationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make()->label('View (Read-only)'),
        ];
    }

    // Keep the user on the edit page after save so they can immediately see the audit entry
    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }
}

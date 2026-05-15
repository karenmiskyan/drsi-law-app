<?php

namespace App\Observers;

use App\Models\Application;
use App\Models\ApplicationAuditLog;
use Illuminate\Support\Facades\Auth;

/**
 * Phase 3.4: audit every admin-driven change to an application.
 *
 * Skips:
 *  - API auto-save traffic (we only record changes made by authenticated admin users
 *    via the Filament panel — detected by Auth::guard('web')->check()).
 *  - Status-only changes (those already show in Meir's "Mark X" actions).
 *
 * Only diffs the `form_data` field. Each changed leaf path becomes one audit row.
 */
class ApplicationObserver
{
    public function updating(Application $application): void
    {
        // Only log when form_data actually changed
        if (! $application->isDirty('form_data')) {
            return;
        }

        // Only log when a web-authenticated admin is making the change
        // (API saves use Sanctum — different guard). Skip otherwise to avoid noise.
        $adminUser = Auth::guard('web')->user();
        if (! $adminUser) {
            return;
        }

        $old = $application->getOriginal('form_data') ?? [];
        $new = $application->form_data ?? [];

        // form_data may be stored as JSON string on the model depending on cast state.
        // Normalise to array.
        if (is_string($old)) $old = json_decode($old, true) ?? [];
        if (is_string($new)) $new = json_decode($new, true) ?? [];

        $changes = [];
        $this->diffRecursive($old, $new, '', $changes);

        foreach ($changes as [$path, $oldVal, $newVal]) {
            ApplicationAuditLog::create([
                'application_id' => $application->id,
                'user_id' => $adminUser->id,
                'field_path' => substr($path, 0, 500),
                'old_value' => is_scalar($oldVal) ? (string) $oldVal : (is_null($oldVal) ? null : json_encode($oldVal)),
                'new_value' => is_scalar($newVal) ? (string) $newVal : (is_null($newVal) ? null : json_encode($newVal)),
            ]);
        }
    }

    /**
     * Walk two nested arrays and collect scalar-leaf differences as [path, old, new].
     * Object subtrees are compared whole; if different, recorded as JSON.
     */
    private function diffRecursive(mixed $old, mixed $new, string $path, array &$out): void
    {
        // Both scalars (or null) — compare directly
        if (! is_array($old) && ! is_array($new)) {
            if ($old !== $new) {
                $out[] = [$path ?: '(root)', $old, $new];
            }
            return;
        }
        // Type mismatch — record as whole-path change
        if (is_array($old) !== is_array($new)) {
            $out[] = [$path ?: '(root)', $old, $new];
            return;
        }
        // Both arrays — recurse
        $keys = array_unique(array_merge(array_keys($old), array_keys($new)));
        foreach ($keys as $key) {
            $sub = $path === '' ? (string) $key : "{$path}.{$key}";
            $this->diffRecursive($old[$key] ?? null, $new[$key] ?? null, $sub, $out);
        }
    }
}

<?php

use App\Models\Document;
use Illuminate\Support\Facades\Route;

// NOTE: `/` is handled by the React SPA via .htaccess (DirectoryIndex index.html).
// Laravel only owns: /api/*, /admin/*, /sanctum/*, /storage/*, /login, /logout, /register.

// Phase 3.2: admin-only inline document preview. Filament is the admin UI and sets
// the session auth; we gate by Filament's authenticated user here.
Route::get('/admin/doc/{id}/view', function (int $id) {
    if (! auth()->check()) {
        abort(403);
    }

    $document = Document::findOrFail($id);
    $fullPath = storage_path('app/private/' . $document->file_path);
    if (! file_exists($fullPath)) {
        abort(404, 'File missing on disk.');
    }

    return response()->file($fullPath, [
        'Content-Type' => $document->mime_type ?? 'application/octet-stream',
        'Content-Disposition' => 'inline; filename="' . addslashes($document->original_name) . '"',
    ]);
})->name('admin.doc.view');

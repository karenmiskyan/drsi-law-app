<?php

use App\Models\Document;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Phase 3.2: admin-only inline document preview. Filament is the admin UI and sets
// the session auth; we gate by Filament's authenticated user here.
Route::get('/admin/doc/{id}/view', function (int $id) {
    // Use the default Filament auth guard — the user must be logged in to the admin panel.
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

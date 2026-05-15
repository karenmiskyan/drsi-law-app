<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\Stage1SubmittedAdminMail;
use App\Mail\Stage2SubmittedAdminMail;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $application = $request->user()->application;

        if (! $application) {
            return response()->json([
                'status' => null,
                'form_data' => null,
                'documents' => [],
            ]);
        }

        return response()->json([
            'id' => $application->id,
            'status' => $application->status,
            'form_data' => $application->form_data,
            'stage1_submitted_at' => $application->stage1_submitted_at,
            'documents' => $application->documents()->get(),
        ]);
    }

    public function saveProgress(Request $request): JsonResponse
    {
        $request->validate([
            'form_data' => 'required|array',
        ]);

        $application = Application::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['form_data' => $request->form_data],
        );

        // Refresh to pick up DB defaults (e.g. status='draft' on first create)
        $application->refresh();

        return response()->json([
            'message' => 'Progress saved.',
            'id' => $application->id,
            'status' => $application->status,
        ]);
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'document_type' => 'required|string',
            'document_index' => 'sometimes|integer|min:0|max:99',
            'needs_translation' => 'sometimes|boolean',
        ]);

        $file = $request->file('file');
        $userId = $request->user()->id;
        $docType = $request->document_type;
        // Phase 3.1b: multi-upload per type — default index is 0 (first/only copy)
        $docIndex = (int) $request->input('document_index', 0);

        // Store in private disk: storage/app/private/documents/{userId}/
        $path = $file->storeAs(
            "documents/{$userId}",
            Str::uuid().'.'.$file->getClientOriginalExtension(),
            'local',
        );

        // Persist document metadata to database
        $application = Application::firstOrCreate(
            ['user_id' => $userId],
            ['status' => 'draft'],
        );

        // Upsert by (document_type, document_index) — each slot is independent, so
        // uploading the same slot twice overwrites while new slots create new rows.
        // Re-uploading also resets the status to 'pending' (Meir: admin should review
        // the new file cleanly if the client replaces a rejected document).
        $document = $application->documents()->updateOrCreate(
            ['document_type' => $docType, 'document_index' => $docIndex],
            [
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'needs_translation' => $request->boolean('needs_translation', false),
                'document_status' => 'pending',
                'admin_comment' => null,
            ],
        );

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'document' => $document,
        ]);
    }

    /**
     * Stream an uploaded document inline (for preview in an iframe / <img>).
     * Per Meir: "is there a way I can view the doc without downloading it?"
     *
     * Scoped to the authenticated user's own application — cannot view others' docs.
     */
    public function viewDocument(Request $request, int $id)
    {
        $application = $request->user()->application;
        if (! $application) {
            abort(404, 'No application found.');
        }

        $document = $application->documents()->where('id', $id)->first();
        if (! $document) {
            abort(404, 'Document not found.');
        }

        $fullPath = storage_path('app/private/' . $document->file_path);
        if (! file_exists($fullPath)) {
            abort(404, 'File missing on disk.');
        }

        return response()->file($fullPath, [
            'Content-Type' => $document->mime_type ?? 'application/octet-stream',
            // Content-Disposition: inline renders in-browser instead of downloading
            'Content-Disposition' => 'inline; filename="' . addslashes($document->original_name) . '"',
        ]);
    }

    public function updateDocumentTranslation(Request $request): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|string',
            'needs_translation' => 'required|boolean',
        ]);

        $application = $request->user()->application;

        if (! $application) {
            return response()->json(['message' => 'No application found.'], 404);
        }

        $document = $application->documents()
            ->where('document_type', $request->document_type)
            ->firstOrFail();

        $document->update(['needs_translation' => $request->needs_translation]);

        return response()->json([
            'message' => 'Translation preference updated.',
            'document' => $document,
        ]);
    }

    public function submitStage1(Request $request): JsonResponse
    {
        $application = $request->user()->application;

        if (! $application || ! $application->form_data) {
            return response()->json([
                'message' => 'No application data found. Please save your progress first.',
            ], 422);
        }

        if ($application->status !== 'draft') {
            return response()->json([
                'message' => 'Application has already been submitted.',
            ], 422);
        }

        $application->update([
            'status' => 'stage1_submitted',
            'stage1_submitted_at' => now(),
        ]);

        // Notify admin (Meir) about the new submission — never fail the request if email is down
        try {
            $adminEmail = config('app.admin_email', 'meir@drsi-law.com');
            Mail::to($adminEmail)->send(new Stage1SubmittedAdminMail($application));
        } catch (\Throwable $e) {
            \Log::warning('Admin notification email failed: ' . $e->getMessage(), [
                'application_id' => $application->id,
            ]);
        }

        return response()->json([
            'message' => 'Stage 1 submitted successfully.',
            'status' => $application->status,
        ]);
    }

    public function submitStage2(Request $request): JsonResponse
    {
        $application = $request->user()->application;

        if (! $application) {
            return response()->json([
                'message' => 'No application found.',
            ], 422);
        }

        if ($application->status !== 'stage2_unlocked') {
            return response()->json([
                'message' => 'Stage 2 cannot be submitted at this time.',
            ], 422);
        }

        $application->update([
            'status' => 'stage2_submitted',
        ]);

        // Notify admin about the Stage 2 submission
        $adminEmail = config('app.admin_email', 'meir@drsi.com');
        Mail::to($adminEmail)->send(new Stage2SubmittedAdminMail($application));

        return response()->json([
            'message' => 'Stage 2 documents submitted for review.',
            'status' => $application->status,
        ]);
    }
}

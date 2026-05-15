<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use Illuminate\Support\Facades\Route;

// Public — Passwordless Auth
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);

// Protected — Requires Sanctum token
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/application', [ApplicationController::class, 'show']);
    Route::put('/application/save-progress', [ApplicationController::class, 'saveProgress']);
    Route::post('/application/upload-document', [ApplicationController::class, 'uploadDocument']);
    Route::patch('/application/document-translation', [ApplicationController::class, 'updateDocumentTranslation']);
    // Phase 3.2: inline preview of an uploaded document (PDF / image)
    Route::get('/application/document/{id}/view', [ApplicationController::class, 'viewDocument']);
    Route::post('/application/submit-stage-1', [ApplicationController::class, 'submitStage1']);
    Route::post('/application/submit-stage-2', [ApplicationController::class, 'submitStage2']);
});

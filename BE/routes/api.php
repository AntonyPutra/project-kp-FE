<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\AssetController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\SocialAidController;

Route::get('/health', function () {
    return response()->json(['status' => 'OK'], 200);
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Assets
    Route::apiResource('assets', AssetController::class);

    // Letters
    Route::get('letters', [LetterController::class, 'index']);
    Route::post('letters', [LetterController::class, 'store']);
    Route::get('letters/{id}', [LetterController::class, 'show']);
    Route::put('letters/{id}/status', [LetterController::class, 'updateStatus']);

    // Social Aids
    Route::get('social-aids', [SocialAidController::class, 'index']);
    Route::post('social-aids', [SocialAidController::class, 'store']); // Admin only
    
    Route::get('social-aids/applications', [SocialAidController::class, 'applications']);
    Route::post('social-aids/{id}/apply', [SocialAidController::class, 'apply']); // Masyarakat only
    Route::put('social-aids/applications/{id}/status', [SocialAidController::class, 'updateApplicationStatus']); // Admin only

    // Audit Logs (Blockchain Explorer)
    Route::get('audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index']);
    Route::get('audit-logs/verify', [\App\Http\Controllers\AuditLogController::class, 'verifyBlockchain']);
});

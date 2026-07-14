<?php

// routes/api.php
use App\Http\Controllers\Api\Auth\{
    RegisterManagerController,
    RegisterOwnerController,
    RegisterDriverController,
    LoginController,
    ForgotPasswordController,
    VerifyOtpController,
    ResetPasswordController
};
use App\Http\Controllers\Api\{SaccoController, VehicleController, TripController};
use Illuminate\Http\Request;

Route::get('/saccos', [SaccoController::class, 'index']);
Route::post('/register/manager', [RegisterManagerController::class, 'store']);
Route::post('/register/owner', [RegisterOwnerController::class, 'store']);
Route::post('/login', [LoginController::class, 'store']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'store']);
Route::post('/verify-otp', [VerifyOtpController::class, 'store']);
Route::post('/reset-password', [ResetPasswordController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy']);
    Route::get('/me', fn(Request $r) => $r->user()->load('sacco', 'vehicleOwner', 'driver'));
    Route::post('/register/driver', [RegisterDriverController::class, 'store']);
    Route::apiResource('vehicles', VehicleController::class)->only(['index', 'store', 'update']);
    Route::apiResource('trips', TripController::class)->only(['index', 'show']);
});

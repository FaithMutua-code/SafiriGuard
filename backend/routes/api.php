<?php

// routes/api.php

use App\Http\Controllers\Api\Auth\{
    RegisterOwnerController,
    LoginController,
    ForgotPasswordController,
    VerifyOtpController,
    ResetPasswordController
};
use App\Http\Controllers\Api\{VehicleController, TripController};

// ─────────────────────────────────────────────────────────────
//  Admin
// ─────────────────────────────────────────────────────────────
use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\AdminVehicleOwnerController;
use App\Http\Controllers\Api\Admin\AdminVehicleController;
use App\Http\Controllers\Api\Admin\AdminTripController;
use App\Http\Controllers\Api\Admin\AdminDriverBehaviorController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminIoTDeviceController;

use Illuminate\Http\Request;

// ─────────────────────────────────────────────────────────────
//  Public — Vehicle Owner Auth
// ─────────────────────────────────────────────────────────────
Route::post('/register/owner',    [RegisterOwnerController::class,  'store']);
Route::post('/login',             [LoginController::class,           'store']);
Route::post('/forgot-password',   [ForgotPasswordController::class,  'store']);
Route::post('/verify-otp',        [VerifyOtpController::class,       'store']);
Route::post('/reset-password',    [ResetPasswordController::class,   'store']);

// ─────────────────────────────────────────────────────────────
//  Protected — Vehicle Owner
// ─────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy']);
    Route::get('/me', fn(Request $r) => $r->user()->load('vehicleOwner'));

    Route::apiResource('vehicles', VehicleController::class)->only(['index', 'store', 'update']);
    Route::apiResource('trips',    TripController::class)->only(['index', 'show']);
});

// ─────────────────────────────────────────────────────────────
//  Admin — Authentication (public)
// ─────────────────────────────────────────────────────────────
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    // Protected admin routes
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me',      [AdminAuthController::class, 'me']);

        // Dashboard stats
        Route::get('/stats', [AdminController::class, 'stats']);

        // Vehicle Owners
        Route::get('/vehicle-owners',                        [AdminVehicleOwnerController::class, 'index']);
        Route::get('/vehicle-owners/{id}',                   [AdminVehicleOwnerController::class, 'show']);
        Route::patch('/vehicle-owners/{id}/toggle-active',   [AdminVehicleOwnerController::class, 'toggleActive']);

        // Vehicles
        Route::get('/vehicles',          [AdminVehicleController::class, 'index']);
        Route::get('/vehicles/{id}',     [AdminVehicleController::class, 'show']);
        Route::patch('/vehicles/{id}',   [AdminVehicleController::class, 'update']);

        // IoT Devices
        Route::post('/iot-devices',          [AdminIoTDeviceController::class, 'store']);
        Route::get('/iot-devices',           [AdminIoTDeviceController::class, 'index']);
        Route::get('/iot-devices/{id}',      [AdminIoTDeviceController::class, 'show']);
        Route::patch('/iot-devices/{id}',    [AdminIoTDeviceController::class, 'update']);

        // Trips
        Route::get('/trips',         [AdminTripController::class, 'index']);
        Route::get('/trips/{id}',    [AdminTripController::class, 'show']);

        // Driving Behaviour
        Route::get('/driving-behaviour',         [AdminDriverBehaviorController::class, 'index']);
        Route::get('/driving-behaviour/summary', [AdminDriverBehaviorController::class, 'summary']);

        // Users
        Route::get('/users',                         [AdminUserController::class, 'index']);
        Route::get('/users/{id}',                    [AdminUserController::class, 'show']);
        Route::patch('/users/{id}/toggle-active',    [AdminUserController::class, 'toggleActive']);
    });
});

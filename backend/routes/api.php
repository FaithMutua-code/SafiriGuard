<?php

use App\Http\Controllers\Api\Auth\{
    RegisterOwnerController,
    LoginController,
    ForgotPasswordController,
    VerifyOtpController,
    ResetPasswordController
};
use App\Http\Controllers\Api\{VehicleController, TripController, DeviceTelemetryController};
use App\Http\Controllers\Api\Owner\{
    OwnerVehicleController,
    OwnerTripController,
    OwnerAlertController,
    OwnerPassengerController,
    OwnerSafetyController,
    OwnerInsightsController,
    PushTokenController,
    OwnerProfileController
};

use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\AdminVehicleOwnerController;
use App\Http\Controllers\Api\Admin\AdminVehicleController;
use App\Http\Controllers\Api\Admin\AdminTripController;
use App\Http\Controllers\Api\Admin\AdminDriverBehaviorController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminIoTDeviceController;

use Illuminate\Http\Request;

// Public — Vehicle Owner Auth
Route::post('/register/owner',  [RegisterOwnerController::class, 'store']);
Route::post('/login',           [LoginController::class,          'store']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'store']);
Route::post('/verify-otp',      [VerifyOtpController::class,      'store']);
Route::post('/reset-password',  [ResetPasswordController::class,  'store']);

// Device telemetry (IoT device auth via X-Device-Key)
Route::middleware('device.key')->group(function () {
    Route::post('/device/telemetry', [DeviceTelemetryController::class, 'store']);
});

// Protected — Vehicle Owner
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy']);
    Route::get('/me', fn (Request $r) => $r->user()->load('vehicleOwner'));

    Route::apiResource('vehicles', VehicleController::class)->only(['index', 'store', 'update']);
    Route::apiResource('trips',    TripController::class)->only(['index', 'show']);

    // Owner API
    Route::prefix('owner')->group(function () {
        Route::get('/vehicles',                    [OwnerVehicleController::class,    'index']);
        Route::get('/vehicles/{vehicle}/overview', [OwnerVehicleController::class,    'overview']);
        Route::get('/trips',                       [OwnerTripController::class,       'index']);
        Route::get('/trips/{trip}',                [OwnerTripController::class,       'show']);
        Route::get('/vehicles/{vehicle}/passengers', [OwnerPassengerController::class, 'show']);
        Route::get('/vehicles/{vehicle}/safety',   [OwnerSafetyController::class,     'show']);
        Route::get('/insights',                    [OwnerInsightsController::class,   'index']);
        Route::get('/alerts',                      [OwnerAlertController::class,      'index']);
        Route::post('/alerts/{alert}/resolve',     [OwnerAlertController::class,      'resolve']);
        Route::post('/push-token',                 [PushTokenController::class,       'store']);
        Route::delete('/push-token',               [PushTokenController::class,       'destroy']);
        Route::get('/profile',                     [OwnerProfileController::class,    'show']);
        Route::put('/profile',                     [OwnerProfileController::class,    'update']);
    });
});

// Admin
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/me',      [AdminAuthController::class, 'me']);
        Route::get('/stats',   [AdminController::class, 'stats']);

        Route::get('/vehicle-owners',                      [AdminVehicleOwnerController::class, 'index']);
        Route::get('/vehicle-owners/{id}',                 [AdminVehicleOwnerController::class, 'show']);
        Route::patch('/vehicle-owners/{id}/toggle-active', [AdminVehicleOwnerController::class, 'toggleActive']);

        Route::get('/vehicles',        [AdminVehicleController::class, 'index']);
        Route::get('/vehicles/{id}',   [AdminVehicleController::class, 'show']);
        Route::patch('/vehicles/{id}', [AdminVehicleController::class, 'update']);

        Route::post('/iot-devices',        [AdminIoTDeviceController::class, 'store']);
        Route::get('/iot-devices',         [AdminIoTDeviceController::class, 'index']);
        Route::get('/iot-devices/{id}',    [AdminIoTDeviceController::class, 'show']);
        Route::patch('/iot-devices/{id}',  [AdminIoTDeviceController::class, 'update']);

        Route::get('/trips',       [AdminTripController::class, 'index']);
        Route::get('/trips/{id}',  [AdminTripController::class, 'show']);

        Route::get('/driving-behaviour',         [AdminDriverBehaviorController::class, 'index']);
        Route::get('/driving-behaviour/summary', [AdminDriverBehaviorController::class, 'summary']);

        Route::get('/users',                       [AdminUserController::class, 'index']);
        Route::get('/users/{id}',                  [AdminUserController::class, 'show']);
        Route::patch('/users/{id}/toggle-active',  [AdminUserController::class, 'toggleActive']);
    });
});

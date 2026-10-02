<?php

namespace App\Http\Middleware;

use App\Models\IotDevice;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeviceKeyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-Device-Key');

        if (! $key) {
            return response()->json(['message' => 'Missing X-Device-Key header'], 401);
        }

        $device = IotDevice::findByApiKey($key);

        if (! $device) {
            return response()->json(['message' => 'Invalid device key'], 401);
        }

        if (! $device->vehicle_id) {
            return response()->json(['message' => 'Device not assigned to a vehicle'], 422);
        }

        $device->update(['last_seen_at' => now()]);

        $request->merge(['iot_device' => $device]);

        return $next($request);
    }
}

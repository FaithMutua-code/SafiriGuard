<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TelemetryService;
use Illuminate\Http\Request;

class DeviceTelemetryController extends Controller
{
    public function __construct(private TelemetryService $telemetry) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'gps'              => 'required|array|min:1',
            'gps.*.lat'        => 'required|numeric|between:-90,90',
            'gps.*.lng'        => 'required|numeric|between:-180,180',
            'gps.*.speed'      => 'required|numeric|min:0',
            'gps.*.ts'         => 'required|date',
            'occupancy'        => 'nullable|array',
            'occupancy.people' => 'required_with:occupancy|integer|min:0',
            'occupancy.ts'     => 'required_with:occupancy|date',
            'events'           => 'nullable|array',
            'events.*.type'    => 'required|in:harsh_braking,sudden_acceleration,sharp_cornering',
            'events.*.severity'=> 'required|integer|between:1,3',
            'events.*.lat'     => 'required|numeric|between:-90,90',
            'events.*.lng'     => 'required|numeric|between:-180,180',
            'events.*.ts'      => 'required|date',
        ]);

        $this->telemetry->processTelemetry($request->iot_device, $validated);

        return response()->json(['message' => 'Telemetry processed'], 202);
    }
}

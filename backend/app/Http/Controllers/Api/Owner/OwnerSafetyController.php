<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Services\TelemetryService;
use Illuminate\Http\Request;

class OwnerSafetyController extends Controller
{
    public function __construct(private TelemetryService $telemetry) {}

    public function show(Request $request, Vehicle $vehicle)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');
        abort_if($vehicle->vehicle_owner_id !== $owner->id, 403, 'Access denied.');

        $range = $request->get('range', 'today');
        $since = match ($range) {
            'week'  => now()->subWeek(),
            'month' => now()->subMonth(),
            default => today(),
        };

        $score = $this->telemetry->getSafetyScore($vehicle, $range);

        $events = $vehicle->drivingEvents()
            ->where('recorded_at', '>=', $since)
            ->orderByDesc('recorded_at')
            ->get();

        $counts = [
            'harsh_braking'       => $events->where('type', 'harsh_braking')->count(),
            'sudden_acceleration' => $events->where('type', 'sudden_acceleration')->count(),
            'sharp_cornering'     => $events->where('type', 'sharp_cornering')->count(),
        ];

        return response()->json([
            'vehicle_id' => $vehicle->id,
            'range'      => $range,
            'score'      => $score,
            'counts'     => $counts,
            'events'     => $events->map(fn ($e) => [
                'id'          => $e->id,
                'type'        => $e->type,
                'severity'    => $e->severity,
                'lat'         => (float) $e->latitude,
                'lng'         => (float) $e->longitude,
                'recorded_at' => $e->recorded_at?->toISOString(),
            ])->values(),
        ]);
    }
}

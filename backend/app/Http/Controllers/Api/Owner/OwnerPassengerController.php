<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class OwnerPassengerController extends Controller
{
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

        $trips = $vehicle->trips()
            ->where('started_at', '>=', $since)
            ->orderBy('started_at')
            ->get();

        $totalPassengers = (int) $trips->sum('boardings_estimate');
        $tripCount = $trips->count();
        $avgPerTrip = $tripCount > 0 ? round($totalPassengers / $tripCount, 1) : 0;

        // Build buckets
        $buckets = [];
        if ($range === 'today') {
            // Hourly buckets (0-23)
            $grouped = $trips->groupBy(fn ($t) => $t->started_at?->format('H') ?? '00');
            for ($h = 0; $h < 24; $h++) {
                $key = str_pad($h, 2, '0', STR_PAD_LEFT);
                $buckets[] = [
                    'label' => "{$key}:00",
                    'value' => (int) ($grouped->get($key)?->sum('boardings_estimate') ?? 0),
                ];
            }
        } else {
            // Daily buckets
            $grouped = $trips->groupBy(fn ($t) => $t->started_at?->format('Y-m-d') ?? 'unknown');
            $current = $since->copy();
            while ($current->lte(now())) {
                $key = $current->format('Y-m-d');
                $buckets[] = [
                    'label' => $current->format('M d'),
                    'value' => (int) ($grouped->get($key)?->sum('boardings_estimate') ?? 0),
                ];
                $current->addDay();
            }
        }

        // Find peak bucket
        $peakBucket = collect($buckets)->sortByDesc('value')->first();

        // Per-trip breakdown
        $perTrip = $trips->map(fn ($t) => [
            'trip_id'            => $t->id,
            'boardings_estimate' => $t->boardings_estimate,
            'started_at'         => $t->started_at?->toISOString(),
            'ended_at'           => $t->ended_at?->toISOString(),
        ])->values();

        $latestCount = $vehicle->latestPassengerCount;

        return response()->json([
            'vehicle_id'                => $vehicle->id,
            'range'                     => $range,
            'total_passengers_estimate' => $totalPassengers,
            'avg_per_trip'              => $avgPerTrip,
            'current_occupancy'         => $latestCount?->people ?? 0,
            'capacity'                  => $vehicle->seat_capacity,
            'buckets'                   => $buckets,
            'peak_bucket'               => $peakBucket,
            'per_trip'                  => $perTrip,
        ]);
    }
}

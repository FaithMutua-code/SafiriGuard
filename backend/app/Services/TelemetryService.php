<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\DrivingEvent;
use App\Models\GpsLog;
use App\Models\IotDevice;
use App\Models\PassengerCount;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Support\Carbon;

class TelemetryService
{
    /**
     * Process an incoming telemetry payload from a device.
     */
    public function processTelemetry(IotDevice $device, array $data): void
    {
        $vehicle = $device->vehicle;
        if (! $vehicle) {
            return;
        }

        $ongoingTrip = $vehicle->trips()->ongoing()->latest('started_at')->first();

        // Process GPS points
        if (! empty($data['gps'])) {
            $ongoingTrip = $this->processGps($vehicle, $data['gps'], $ongoingTrip);
        }

        // Process occupancy
        if (! empty($data['occupancy'])) {
            $this->processOccupancy($vehicle, $data['occupancy'], $ongoingTrip);
        }

        // Process driving events
        if (! empty($data['events'])) {
            $this->processEvents($vehicle, $data['events'], $ongoingTrip);
        }
    }

    private function processGps(Vehicle $vehicle, array $gpsPoints, ?Trip $ongoingTrip): ?Trip
    {
        foreach ($gpsPoints as $point) {
            $ts = Carbon::parse($point['ts']);
            $speed = (float) $point['speed'];

            $gpsLog = GpsLog::create([
                'vehicle_id'  => $vehicle->id,
                'trip_id'     => $ongoingTrip?->id,
                'latitude'    => $point['lat'],
                'longitude'   => $point['lng'],
                'speed'       => $speed,
                'recorded_at' => $ts,
            ]);

            // Speeding alert
            if ($speed > 80) {
                $this->createAlert($vehicle, 'speeding', 'warning',
                    "Speed of {$speed} km/h exceeds 80 km/h limit.",
                    $point['lat'], $point['lng']);
            }

            // Trip detection: start
            if (! $ongoingTrip && $speed > 5) {
                $ongoingTrip = Trip::create([
                    'vehicle_id' => $vehicle->id,
                    'started_at' => $ts,
                ]);
                $gpsLog->update(['trip_id' => $ongoingTrip->id]);
            }
        }

        // Trip detection: end (all points have speed <= 5)
        if ($ongoingTrip) {
            $allSlow = collect($gpsPoints)->every(fn ($p) => (float) $p['speed'] <= 5);
            if ($allSlow) {
                $lastMoving = $vehicle->gpsLogs()
                    ->where('trip_id', $ongoingTrip->id)
                    ->where('speed', '>', 5)
                    ->latest('recorded_at')
                    ->first();

                $minutesSinceMoving = $lastMoving
                    ? $lastMoving->recorded_at->diffInMinutes(now())
                    : 999;

                if ($minutesSinceMoving >= 5) {
                    $this->endTrip($ongoingTrip, $vehicle);
                    $ongoingTrip = null;
                }
            }
        }

        return $ongoingTrip;
    }

    private function processOccupancy(Vehicle $vehicle, array $occupancy, ?Trip $ongoingTrip): void
    {
        $people = (int) $occupancy['people'];

        // Silently reject invalid occupancy
        if ($people < 0) {
            return;
        }

        PassengerCount::create([
            'vehicle_id'  => $vehicle->id,
            'trip_id'     => $ongoingTrip?->id,
            'people'      => $people,
            'recorded_at' => Carbon::parse($occupancy['ts']),
        ]);

        // Over-capacity alert
        if ($people > $vehicle->seat_capacity) {
            $this->createAlert($vehicle, 'over_capacity', 'warning',
                "Occupancy ({$people}) exceeds seat capacity ({$vehicle->seat_capacity}).");
        }

        // Update boarding estimate on ongoing trip
        if ($ongoingTrip) {
            $this->updateBoardingEstimate($ongoingTrip, $vehicle);
        }
    }

    private function processEvents(Vehicle $vehicle, array $events, ?Trip $ongoingTrip): void
    {
        foreach ($events as $event) {
            DrivingEvent::create([
                'vehicle_id'  => $vehicle->id,
                'trip_id'     => $ongoingTrip?->id,
                'type'        => $event['type'],
                'severity'    => $event['severity'],
                'latitude'    => $event['lat'],
                'longitude'   => $event['lng'],
                'recorded_at' => Carbon::parse($event['ts']),
            ]);

            $severityLabel = match ((int) $event['severity']) {
                3 => 'critical',
                2 => 'warning',
                default => 'info',
            };

            $typeLabel = str_replace('_', ' ', $event['type']);
            $this->createAlert(
                $vehicle,
                $event['type'],
                $severityLabel,
                ucfirst($typeLabel) . " detected (severity {$event['severity']}/3).",
                $event['lat'],
                $event['lng']
            );
        }
    }

    private function endTrip(Trip $trip, Vehicle $vehicle): void
    {
        $distance = $this->calculateTripDistance($trip);
        $this->updateBoardingEstimate($trip, $vehicle);

        $trip->update([
            'ended_at'    => now(),
            'distance_km' => $distance,
        ]);
    }

    private function updateBoardingEstimate(Trip $trip, Vehicle $vehicle): void
    {
        $counts = $trip->passengerCounts()->orderBy('recorded_at')->pluck('people')->toArray();

        $boardings = 0;
        for ($i = 1; $i < count($counts); $i++) {
            $diff = $counts[$i] - $counts[$i - 1];
            if ($diff > 0) {
                $boardings += $diff;
            }
        }
        // First reading counts as initial boardings
        if (count($counts) > 0 && $counts[0] > 0) {
            $boardings += $counts[0];
        }

        $trip->update([
            'boardings_estimate' => $boardings,
            'revenue_estimate'   => $boardings * (float) $vehicle->fare_amount,
        ]);
    }

    public function getVehicleStatus(Vehicle $vehicle): string
    {
        $device = $vehicle->iotDevices()->latest('last_seen_at')->first();

        if (! $device || ! $device->last_seen_at || $device->last_seen_at->lt(now()->subMinutes(2))) {
            return 'offline';
        }

        $latestLog = $vehicle->latestGpsLog;
        if ($latestLog && (float) $latestLog->speed > 5) {
            return 'active';
        }

        return 'idle';
    }

    public function getSafetyScore(Vehicle $vehicle, ?string $range = null): ?int
    {
        $query = $vehicle->trips()->completed();
        $eventsQuery = $vehicle->drivingEvents();

        if ($range) {
            $since = match ($range) {
                'today' => today(),
                'week'  => now()->subWeek(),
                'month' => now()->subMonth(),
                default => null,
            };
            if ($since) {
                $query->where('started_at', '>=', $since);
                $eventsQuery->where('recorded_at', '>=', $since);
            }
        }

        $totalDistance = (float) $query->sum('distance_km');
        if ($totalDistance <= 0) {
            return null;
        }

        $totalSeverity = (int) $eventsQuery->sum('severity');
        $score = 100 - ($totalSeverity / ($totalDistance / 100));

        return (int) max(0, min(100, round($score)));
    }

    public function checkOfflineDevices(): void
    {
        $threshold = now()->subMinutes(2);

        $offlineDevices = IotDevice::whereNotNull('vehicle_id')
            ->where(function ($q) use ($threshold) {
                $q->where('last_seen_at', '<', $threshold)
                  ->orWhereNull('last_seen_at');
            })
            ->get();

        foreach ($offlineDevices as $device) {
            $hasActiveAlert = Alert::where('vehicle_id', $device->vehicle_id)
                ->where('type', 'device_offline')
                ->active()
                ->exists();

            if (! $hasActiveAlert) {
                $this->createAlert(
                    $device->vehicle,
                    'device_offline',
                    'critical',
                    "Device \"{$device->name}\" has been offline for more than 2 minutes."
                );
            }
        }
    }

    private function createAlert(
        Vehicle $vehicle,
        string $type,
        string $severity,
        string $description,
        ?float $lat = null,
        ?float $lng = null
    ): void {
        Alert::create([
            'vehicle_id'       => $vehicle->id,
            'type'             => $type,
            'severity'         => $severity,
            'description'      => $description,
            'suggested_action' => Alert::SUGGESTED_ACTIONS[$type] ?? null,
            'latitude'         => $lat,
            'longitude'        => $lng,
        ]);
    }

    public function calculateTripDistance(Trip $trip): float
    {
        $logs = $trip->gpsLogs()->orderBy('recorded_at')->get(['latitude', 'longitude']);

        $distance = 0;
        for ($i = 1; $i < $logs->count(); $i++) {
            $distance += $this->haversine(
                (float) $logs[$i - 1]->latitude,
                (float) $logs[$i - 1]->longitude,
                (float) $logs[$i]->latitude,
                (float) $logs[$i]->longitude
            );
        }

        return round($distance, 2);
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}

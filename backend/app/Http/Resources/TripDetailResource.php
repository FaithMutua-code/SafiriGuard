<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'vehicle_id'         => $this->vehicle_id,
            'vehicle_plate'      => $this->vehicle?->number_plate,
            'route_name'         => $this->vehicle?->route_name,
            'status'             => $this->is_ongoing ? 'ongoing' : 'completed',
            'started_at'         => $this->started_at?->toISOString(),
            'ended_at'           => $this->ended_at?->toISOString(),
            'distance_km'        => $this->distance_km,
            'duration_minutes'   => $this->duration_minutes,
            'boardings_estimate' => $this->boardings_estimate,
            'revenue_estimate'   => $this->revenue_estimate,
            'route_points'       => $this->whenLoaded('gpsLogs', fn () =>
                $this->gpsLogs->sortBy('recorded_at')->values()->map(fn ($log) => [
                    'lat'         => (float) $log->latitude,
                    'lng'         => (float) $log->longitude,
                    'speed'       => (float) $log->speed,
                    'recorded_at' => $log->recorded_at?->toISOString(),
                ])
            ),
            'occupancy_timeline' => $this->whenLoaded('passengerCounts', fn () =>
                $this->passengerCounts->sortBy('recorded_at')->values()->map(fn ($pc) => [
                    'people'      => $pc->people,
                    'recorded_at' => $pc->recorded_at?->toISOString(),
                ])
            ),
            'events'             => $this->whenLoaded('drivingEvents', fn () =>
                $this->drivingEvents->sortBy('recorded_at')->values()->map(fn ($e) => [
                    'id'          => $e->id,
                    'type'        => $e->type,
                    'severity'    => $e->severity,
                    'lat'         => (float) $e->latitude,
                    'lng'         => (float) $e->longitude,
                    'recorded_at' => $e->recorded_at?->toISOString(),
                ])
            ),
        ];
    }
}

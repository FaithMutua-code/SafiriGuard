<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'vehicle_id'         => $this->vehicle_id,
            'vehicle_plate'      => $this->whenLoaded('vehicle', fn () => $this->vehicle->number_plate),
            'route_name'         => $this->whenLoaded('vehicle', fn () => $this->vehicle->route_name),
            'status'             => $this->is_ongoing ? 'ongoing' : 'completed',
            'started_at'         => $this->started_at?->toISOString(),
            'ended_at'           => $this->ended_at?->toISOString(),
            'distance_km'        => $this->distance_km,
            'duration_minutes'   => $this->duration_minutes,
            'boardings_estimate' => $this->boardings_estimate,
            'revenue_estimate'   => $this->revenue_estimate,
        ];
    }
}

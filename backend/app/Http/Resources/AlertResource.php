<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'vehicle_id'       => $this->vehicle_id,
            'vehicle_plate'    => $this->whenLoaded('vehicle', fn () => $this->vehicle->number_plate),
            'type'             => $this->type,
            'severity'         => $this->severity,
            'description'      => $this->description,
            'suggested_action' => $this->suggested_action,
            'location'         => ($this->latitude && $this->longitude) ? [
                'lat' => (float) $this->latitude,
                'lng' => (float) $this->longitude,
            ] : null,
            'resolved_at'      => $this->resolved_at?->toISOString(),
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DrivingEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'type'        => $this->type,
            'severity'    => $this->severity,
            'lat'         => (float) $this->latitude,
            'lng'         => (float) $this->longitude,
            'recorded_at' => $this->recorded_at?->toISOString(),
        ];
    }
}

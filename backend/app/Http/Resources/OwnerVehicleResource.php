<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OwnerVehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'number_plate'     => $this->number_plate,
            'make'             => $this->make,
            'model'            => $this->model,
            'year'             => $this->year,
            'seat_capacity'    => $this->seat_capacity,
            'fare_amount'      => $this->fare_amount,
            'route_name'       => $this->route_name,
            'status'           => $this->computed_status ?? 'offline',
            'occupancy'        => [
                'people'   => $this->latestPassengerCount?->people ?? 0,
                'capacity' => $this->seat_capacity,
            ],
            'today'            => [
                'trips' => $this->today_trips_count ?? 0,
            ],
            'safety_score'     => $this->computed_safety_score,
            'device_connected' => $this->device_connected ?? false,
            'last_seen_at'     => $this->computed_last_seen_at,
            'last_location'    => $this->latestGpsLog ? [
                'lat' => (float) $this->latestGpsLog->latitude,
                'lng' => (float) $this->latestGpsLog->longitude,
            ] : null,
        ];
    }
}

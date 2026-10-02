<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OwnerVehicleOverviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'vehicle'   => [
                'id'            => $this->id,
                'number_plate'  => $this->number_plate,
                'make'          => $this->make,
                'model'         => $this->model,
                'year'          => $this->year,
                'seat_capacity' => $this->seat_capacity,
                'fare_amount'   => $this->fare_amount,
                'route_name'    => $this->route_name,
            ],
            'status'    => $this->computed_status ?? 'offline',
            'location'  => $this->latestGpsLog ? [
                'lat' => (float) $this->latestGpsLog->latitude,
                'lng' => (float) $this->latestGpsLog->longitude,
            ] : null,
            'occupancy' => [
                'people'   => $this->latestPassengerCount?->people ?? 0,
                'capacity' => $this->seat_capacity,
            ],
            'today'     => $this->computed_today ?? [
                'trips'               => 0,
                'passengers_estimate'  => 0,
                'distance_km'          => '0.00',
                'revenue_estimate'     => '0.00',
            ],
            'safety'    => [
                'score'       => $this->computed_safety_score,
                'events_today' => $this->computed_events_today ?? 0,
            ],
        ];
    }
}

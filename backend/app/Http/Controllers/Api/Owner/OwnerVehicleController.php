<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Resources\OwnerVehicleOverviewResource;
use App\Http\Resources\OwnerVehicleResource;
use App\Models\Vehicle;
use App\Services\TelemetryService;
use Illuminate\Http\Request;

class OwnerVehicleController extends Controller
{
    public function __construct(private TelemetryService $telemetry) {}

    public function index(Request $request)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $vehicles = $owner->vehicles()
            ->with(['latestGpsLog', 'latestPassengerCount', 'iotDevices'])
            ->get();

        $vehicles->each(function (Vehicle $v) {
            $v->computed_status       = $this->telemetry->getVehicleStatus($v);
            $v->computed_safety_score = $this->telemetry->getSafetyScore($v);
            $v->device_connected      = $v->iotDevices->contains(fn ($d) =>
                $d->last_seen_at && $d->last_seen_at->gt(now()->subMinutes(2))
            );
            $v->computed_last_seen_at = $v->iotDevices->max('last_seen_at');
            $v->today_trips_count     = $v->trips()->where('started_at', '>=', today())->count();
        });

        return OwnerVehicleResource::collection($vehicles);
    }

    public function overview(Request $request, Vehicle $vehicle)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');
        abort_if($vehicle->vehicle_owner_id !== $owner->id, 403, 'Access denied.');

        $vehicle->load(['latestGpsLog', 'latestPassengerCount', 'iotDevices']);

        $todayTrips = $vehicle->trips()->where('started_at', '>=', today())->get();

        $vehicle->computed_status       = $this->telemetry->getVehicleStatus($vehicle);
        $vehicle->computed_safety_score = $this->telemetry->getSafetyScore($vehicle, 'today');
        $vehicle->computed_events_today = $vehicle->drivingEvents()
            ->where('recorded_at', '>=', today())->count();
        $vehicle->computed_today = [
            'trips'               => $todayTrips->count(),
            'passengers_estimate' => (int) $todayTrips->sum('boardings_estimate'),
            'distance_km'         => number_format((float) $todayTrips->sum('distance_km'), 2, '.', ''),
            'revenue_estimate'    => number_format((float) $todayTrips->sum('revenue_estimate'), 2, '.', ''),
        ];

        return new OwnerVehicleOverviewResource($vehicle);
    }
}

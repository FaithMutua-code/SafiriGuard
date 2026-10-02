<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Resources\TripDetailResource;
use App\Http\Resources\TripResource;
use App\Models\Trip;
use Illuminate\Http\Request;

class OwnerTripController extends Controller
{
    public function index(Request $request)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $vehicleIds = $owner->vehicles()->pluck('id');

        $query = Trip::whereIn('vehicle_id', $vehicleIds)
            ->with('vehicle:id,number_plate,route_name')
            ->orderByDesc('started_at');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->filled('status')) {
            if ($request->status === 'ongoing') {
                $query->ongoing();
            } elseif ($request->status === 'completed') {
                $query->completed();
            }
        }

        return TripResource::collection($query->paginate(15));
    }

    public function show(Request $request, Trip $trip)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $vehicleIds = $owner->vehicles()->pluck('id');
        abort_if(! $vehicleIds->contains($trip->vehicle_id), 403, 'Access denied.');

        $trip->load(['vehicle', 'gpsLogs', 'passengerCounts', 'drivingEvents']);

        return new TripDetailResource($trip);
    }
}

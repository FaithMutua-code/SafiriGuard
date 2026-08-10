<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class AdminTripController extends Controller
{
    /**
     * List all trips across the platform with vehicle and owner info.
     */
    public function index(Request $request)
    {
        $query = Trip::with([
            'vehicle:id,number_plate,vehicle_owner_id',
            'vehicle.owner.user:id,name',
        ]);

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($from = $request->query('from')) {
            $query->where('start_time', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('start_time', '<=', $to . ' 23:59:59');
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $trips = $query->latest('start_time')->paginate(20);

        // Append computed duration for each trip
        $trips->getCollection()->transform(function ($trip) {
            $started = $trip->start_time ? \Carbon\Carbon::parse($trip->start_time) : null;
            $ended   = $trip->end_time   ? \Carbon\Carbon::parse($trip->end_time)   : null;
            $trip->duration_minutes = ($started && $ended) ? $started->diffInMinutes($ended) : null;
            return $trip;
        });

        return response()->json($trips);
    }

    /**
     * Get details of a single trip including GPS logs and behavior events.
     */
    public function show($id)
    {
        $trip = Trip::with([
            'vehicle:id,number_plate',
            'vehicle.owner.user:id,name',
            'passengerCounts',
            'behaviorRecords',
        ])->findOrFail($id);

        return response()->json(['trip' => $trip]);
    }
}

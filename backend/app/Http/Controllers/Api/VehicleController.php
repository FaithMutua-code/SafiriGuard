<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'vehicle_owner', 403, 'Only vehicle owners can register vehicles.');

        $owner = $user->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $data = $request->validate([
            'number_plate'  => 'required|string|unique:vehicles,number_plate',
            'make'          => 'nullable|string',
            'model'         => 'nullable|string',
            'year'          => 'nullable|integer|min:1980|max:' . (date('Y') + 1),
            'seat_capacity' => 'required|integer|min:1|max:100',
            'fare_amount'   => 'required|numeric|min:0',
            'route_name'    => 'nullable|string|max:255',
        ]);

        $vehicle = Vehicle::create([
            'vehicle_owner_id' => $owner->id,
            'number_plate'     => strtoupper($data['number_plate']),
            'make'             => $data['make'] ?? null,
            'model'            => $data['model'] ?? null,
            'year'             => $data['year'] ?? null,
            'seat_capacity'    => $data['seat_capacity'],
            'fare_amount'      => $data['fare_amount'],
            'route_name'       => $data['route_name'] ?? null,
        ]);

        return response()->json(['vehicle' => $vehicle], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'vehicle_owner', 403, 'Access denied.');

        $owner = $user->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $vehicles = Vehicle::where('vehicle_owner_id', $owner->id)
            ->with(['iotDevices:id,vehicle_id,name,last_seen_at'])
            ->get();

        return response()->json(['vehicles' => $vehicles]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $owner = $user->vehicleOwner;
        $vehicle = Vehicle::where('id', $id)
            ->where('vehicle_owner_id', $owner?->id)
            ->firstOrFail();

        $data = $request->validate([
            'make'          => 'nullable|string',
            'model'         => 'nullable|string',
            'year'          => 'nullable|integer|min:1980|max:' . (date('Y') + 1),
            'seat_capacity' => 'sometimes|integer|min:1|max:100',
            'fare_amount'   => 'sometimes|numeric|min:0',
            'route_name'    => 'nullable|string|max:255',
        ]);

        $vehicle->update($data);

        return response()->json(['vehicle' => $vehicle->fresh()]);
    }
}

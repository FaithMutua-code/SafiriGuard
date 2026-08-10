<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * Register a new vehicle under the authenticated vehicle owner.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'vehicle_owner', 403, 'Only vehicle owners can register vehicles.');

        $owner = $user->vehicleOwner;
        abort_if(!$owner, 422, 'Owner profile not found.');

        $data = $request->validate([
            'number_plate' => 'required|string|unique:vehicles,number_plate',
            'make'         => 'nullable|string',
            'model'        => 'nullable|string',
            'year'         => 'nullable|integer|min:1980|max:' . (date('Y') + 1),
        ]);

        $vehicle = Vehicle::create([
            'vehicle_owner_id' => $owner->id,
            'sacco_id'         => $owner->sacco_id,
            'number_plate'     => strtoupper($data['number_plate']),
            'make'             => $data['make'] ?? null,
            'model'            => $data['model'] ?? null,
            'year'             => $data['year'] ?? null,
        ]);

        return response()->json(['vehicle' => $vehicle], 201);
    }

    /**
     * List vehicles belonging to the authenticated vehicle owner.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'vehicle_owner', 403, 'Access denied.');

        $owner = $user->vehicleOwner;
        abort_if(!$owner, 422, 'Owner profile not found.');

        $vehicles = Vehicle::where('vehicle_owner_id', $owner->id)
            ->with(['iotDevice:id,vehicle_id,device_identifier,is_online,last_seen_at'])
            ->get();

        return response()->json(['vehicles' => $vehicles]);
    }

    /**
     * Update a vehicle (owner can edit their own vehicles).
     */
    public function update(Request $request, $id)
    {
        $user    = $request->user();
        $owner   = $user->vehicleOwner;
        $vehicle = Vehicle::where('id', $id)
            ->where('vehicle_owner_id', $owner?->id)
            ->firstOrFail();

        $data = $request->validate([
            'make'  => 'nullable|string',
            'model' => 'nullable|string',
            'year'  => 'nullable|integer|min:1980|max:' . (date('Y') + 1),
        ]);

        $vehicle->update($data);

        return response()->json(['vehicle' => $vehicle->fresh()]);
    }
}

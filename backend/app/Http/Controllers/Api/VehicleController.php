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
        abort_if(!$owner, 422, 'Owner profile not found.');

        $data = $request->validate([
            'number_plate' => 'required|string|unique:vehicles,number_plate',
            'make' => 'nullable|string',
            'model' => 'nullable|string',
            'year' => 'nullable|integer|min:1980|max:' . (date('Y') + 1),
        ]);

        $vehicle = Vehicle::create([
            'vehicle_owner_id' => $owner->id,
            'sacco_id' => $owner->sacco_id,
            'number_plate' => strtoupper($data['number_plate']),
            'make' => $data['make'] ?? null,
            'model' => $data['model'] ?? null,
            'year' => $data['year'] ?? null,
        ]);

        return response()->json(['vehicle' => $vehicle], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $vehicles = match ($user->role) {
            'sacco_manager' => \App\Models\Vehicle::where('sacco_id', $user->sacco_id)->get(),
            'vehicle_owner' => \App\Models\Vehicle::where('vehicle_owner_id', $user->vehicleOwner->id)->get(),
            'driver' => \App\Models\Vehicle::where('driver_id', $user->driver->id)->get(),
            default => collect(),
        };

        return response()->json(['vehicles' => $vehicles]);
    }
}

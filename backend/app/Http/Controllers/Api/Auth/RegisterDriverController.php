<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RegisterDriverController extends Controller
{

    // Invited by an authenticated vehicle owner -> inherits sacco_id automatically
    public function store(Request $request)
    {
        /** @var User $owner */
        $owner = $request->user();
        abort_unless($owner->role === 'vehicle_owner', 403, 'Only vehicle owners can register drivers.');

        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string',
            'password' => 'required|min:8',
            'license_number' => 'required|string|unique:drivers,license_number',
            'license_expiry' => 'nullable|date',
            'vehicle_id' => 'nullable|exists:vehicles,id', // optional immediate assignment
        ]);

        return DB::transaction(function () use ($data, $owner) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'role' => 'driver',
                'sacco_id' => $owner->sacco_id, // inherited, not chosen
            ]);

            $driver = Driver::create([
                'user_id' => $user->id,
                'sacco_id' => $owner->sacco_id,
                'vehicle_owner_id' => $owner->vehicleOwner->id,
                'license_number' => $data['license_number'],
                'license_expiry' => $data['license_expiry'] ?? null,
            ]);

            if (!empty($data['vehicle_id'])) {
                $vehicle = Vehicle::where('id', $data['vehicle_id'])
                    ->where('vehicle_owner_id', $owner->vehicleOwner->id)
                    ->firstOrFail();
                $vehicle->update(['driver_id' => $driver->id]);
            }

            return response()->json(['driver' => $driver->load('user', 'vehicle')], 201);
        });
    }
}

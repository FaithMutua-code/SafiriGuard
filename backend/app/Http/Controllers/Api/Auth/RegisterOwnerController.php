<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VehicleOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterOwnerController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string',
            'password' => 'required|min:8',
            'sacco_id' => 'required|exists:saccos,id',
            'id_number' => 'required|string|unique:vehicle_owners,id_number',
            'next_of_kin' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'role' => 'vehicle_owner',
                'sacco_id' => $data['sacco_id'],
            ]);

            $owner = VehicleOwner::create([
                'user_id' => $user->id,
                'sacco_id' => $data['sacco_id'],
                'id_number' => $data['id_number'],
                'next_of_kin' => $data['next_of_kin'] ?? null,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user->load('sacco', 'vehicleOwner'),
                'token' => $token,
            ], 201);
        });
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\IotDevice;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleOwner;

class AdminController extends Controller
{
    /**
     * Platform-wide dashboard statistics.
     */
    public function stats()
    {
        $totalOwners   = VehicleOwner::count();
        $totalVehicles = Vehicle::count();
        $totalUsers    = User::where('role', '!=', 'admin')->count();
        $activeUsers   = User::where('role', '!=', 'admin')->where('is_active', true)->count();
        $totalDevices  = IotDevice::count();
        $onlineDevices = IotDevice::where('is_online', true)->count();
        $totalTrips    = Trip::count();

        // Recent registrations (last 10 vehicle owners with user info)
        $recentOwners = VehicleOwner::with('user:id,name,email,created_at,is_active')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'name'       => $o->user->name ?? '—',
                'email'      => $o->user->email ?? '—',
                'is_active'  => $o->user->is_active ?? true,
                'joined_at'  => $o->created_at?->toDateString(),
            ]);

        // Recent trips
        $recentTrips = Trip::with('vehicle:id,number_plate')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($t) => [
                'id'            => $t->id,
                'vehicle'       => $t->vehicle->number_plate ?? '—',
                'started_at'    => $t->started_at,
                'ended_at'      => $t->ended_at,
                'passenger_count' => $t->passenger_count ?? 0,
            ]);

        return response()->json([
            'stats' => [
                'total_owners'   => $totalOwners,
                'total_vehicles' => $totalVehicles,
                'total_users'    => $totalUsers,
                'active_users'   => $activeUsers,
                'inactive_users' => $totalUsers - $activeUsers,
                'total_devices'  => $totalDevices,
                'online_devices' => $onlineDevices,
                'total_trips'    => $totalTrips,
            ],
            'recent_owners' => $recentOwners,
            'recent_trips'  => $recentTrips,
        ]);
    }
}

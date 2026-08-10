<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VehicleOwner;
use Illuminate\Http\Request;

class AdminVehicleOwnerController extends Controller
{
    /**
     * List all vehicle owners with vehicle count and status.
     */
    public function index(Request $request)
    {
        $query = VehicleOwner::with([
            'user:id,name,email,phone,is_active,created_at',
        ])->withCount('vehicles');

        // Search by name or email
        if ($search = $request->query('search')) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
            );
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $active = filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN);
            $query->whereHas('user', fn($q) => $q->where('is_active', $active));
        }

        $owners = $query->latest()->paginate(20);

        return response()->json($owners);
    }

    /**
     * Get a single vehicle owner with their vehicles.
     */
    public function show($id)
    {
        $owner = VehicleOwner::with([
            'user:id,name,email,phone,is_active,created_at',
            'vehicles:id,vehicle_owner_id,number_plate,make,model,year',
        ])->findOrFail($id);

        return response()->json(['owner' => $owner]);
    }

    /**
     * Activate or deactivate a vehicle owner's account.
     */
    public function toggleActive($id)
    {
        $owner = VehicleOwner::with(['user'])->findOrFail($id);
        $user  = $owner->user;

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'Account activated.' : 'Account deactivated.',
            'is_active' => $user->is_active,
        ]);
    }
}

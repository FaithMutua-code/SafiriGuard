<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class AdminVehicleController extends Controller
{
    /**
     * List all registered vehicles across the platform.
     */
    public function index(Request $request)
    {
        $query = Vehicle::with([
            'owner.user:id,name,email',
            'iotDevice:id,vehicle_id,device_identifier,is_online,last_seen_at,status',
        ])->withCount('trips');

        if ($search = $request->query('search')) {
            $query->where('number_plate', 'like', "%$search%")
                  ->orWhere('make', 'like', "%$search%")
                  ->orWhere('model', 'like', "%$search%");
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $vehicles = $query->latest()->paginate(20);

        return response()->json($vehicles);
    }

    /**
     * Get a single vehicle with full details.
     */
    public function show($id)
    {
        $vehicle = Vehicle::with([
            'owner.user:id,name,email,phone',
            'iotDevice',
            'trips' => fn($q) => $q->latest()->take(10),
        ])->findOrFail($id);

        return response()->json(['vehicle' => $vehicle]);
    }

    /**
     * Update vehicle status or details.
     */
    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $data = $request->validate([
            'status' => 'sometimes|in:active,inactive,suspended',
            'make'   => 'sometimes|string',
            'model'  => 'sometimes|string',
            'year'   => 'sometimes|integer',
        ]);

        $vehicle->update($data);

        return response()->json(['message' => 'Vehicle updated.', 'vehicle' => $vehicle->fresh()]);
    }
}

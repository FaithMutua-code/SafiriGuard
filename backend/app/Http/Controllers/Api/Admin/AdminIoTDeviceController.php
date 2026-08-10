<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\IotDevice;
use Illuminate\Http\Request;

class AdminIoTDeviceController extends Controller
{
    /**
     * List all IoT devices across the platform.
     */
    public function index(Request $request)
    {
        $query = IotDevice::with([
            'vehicle:id,number_plate,vehicle_owner_id',
            'vehicle.owner.user:id,name',
        ]);

        if ($search = $request->query('search')) {
            $query->where('device_identifier', 'like', "%$search%")
                  ->orWhere('device_type', 'like', "%$search%");
        }

        if ($request->has('is_online')) {
            $online = filter_var($request->query('is_online'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_online', $online);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $devices = $query->latest()->paginate(20);

        return response()->json($devices);
    }

    /**
     * Get a single IoT device.
     */
    public function show($id)
    {
        $device = IotDevice::with([
            'vehicle:id,number_plate,make,model',
            'vehicle.owner.user:id,name,email',
        ])->findOrFail($id);

        return response()->json(['device' => $device]);
    }

    /**
     * Update device status (active/inactive/maintenance).
     */
    public function update(Request $request, $id)
    {
        $device = IotDevice::findOrFail($id);

        $data = $request->validate([
            'status'   => 'sometimes|in:active,inactive,maintenance',
            'vehicle_id' => 'sometimes|nullable|exists:vehicles,id',
        ]);

        $device->update($data);

        return response()->json(['message' => 'Device updated.', 'device' => $device->fresh()]);
    }

    /**
     * Register a new IoT device.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'device_identifier' => 'required|string|unique:iot_devices,device_identifier',
            'device_type'       => 'required|string',
            'vehicle_id'        => 'nullable|exists:vehicles,id',
            'firmware_version'  => 'nullable|string',
        ]);

        $device = IotDevice::create($data);

        return response()->json(['message' => 'Device registered.', 'device' => $device], 201);
    }
}

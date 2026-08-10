<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DriverBehaviorRecord;
use Illuminate\Http\Request;

class AdminDriverBehaviorController extends Controller
{
    /**
     * List all unsafe driving events across the platform.
     */
    public function index(Request $request)
    {
        $query = DriverBehaviorRecord::with([
            'trip:id,vehicle_id,start_time',
            'trip.vehicle:id,number_plate',
            'trip.vehicle.owner.user:id,name',
        ]);

        if ($eventType = $request->query('event_type')) {
            $query->where('event_type', $eventType);
        }

        if ($from = $request->query('from')) {
            $query->where('recorded_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('recorded_at', '<=', $to . ' 23:59:59');
        }

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->whereHas('trip', fn($q) => $q->where('vehicle_id', $vehicleId));
        }

        if ($severity = $request->query('severity')) {
            $query->where('severity', $severity);
        }

        $records = $query->latest('recorded_at')->paginate(20);

        return response()->json($records);
    }

    /**
     * Summary/stats: event counts by type.
     */
    public function summary()
    {
        $counts = DriverBehaviorRecord::selectRaw('event_type, count(*) as total')
            ->groupBy('event_type')
            ->get();

        return response()->json(['summary' => $counts]);
    }
}

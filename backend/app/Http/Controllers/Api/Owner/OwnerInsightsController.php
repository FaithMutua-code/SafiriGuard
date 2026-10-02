<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Services\InsightsService;
use Illuminate\Http\Request;

class OwnerInsightsController extends Controller
{
    public function __construct(private InsightsService $insights) {}

    public function index(Request $request)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $range = $request->get('range', 'week');
        $vehicleIds = $owner->vehicles()->pluck('id');

        $since = match ($range) {
            'today' => today(),
            'month' => now()->subMonth(),
            default => now()->subWeek(),
        };

        $trips = \App\Models\Trip::whereIn('vehicle_id', $vehicleIds)
            ->where('started_at', '>=', $since)
            ->get();

        $totals = [
            'trips'               => $trips->count(),
            'passengers_estimate' => (int) $trips->sum('boardings_estimate'),
            'distance_km'         => number_format((float) $trips->sum('distance_km'), 2, '.', ''),
            'revenue_estimate'    => number_format((float) $trips->sum('revenue_estimate'), 2, '.', ''),
        ];

        $insightsList = $this->insights->getInsights($owner->id, $range);

        return response()->json([
            'range'    => $range,
            'totals'   => $totals,
            'insights' => $insightsList,
        ]);
    }
}

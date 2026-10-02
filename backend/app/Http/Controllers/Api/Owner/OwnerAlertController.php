<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use Illuminate\Http\Request;

class OwnerAlertController extends Controller
{
    public function index(Request $request)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $vehicleIds = $owner->vehicles()->pluck('id');
        $status = $request->get('status', 'active');

        $query = Alert::whereIn('vehicle_id', $vehicleIds)
            ->with('vehicle:id,number_plate')
            ->orderByDesc('created_at');

        if ($status === 'active') {
            $query->active();
        } elseif ($status === 'resolved') {
            $query->resolved();
        }

        return AlertResource::collection($query->paginate(20));
    }

    public function resolve(Request $request, Alert $alert)
    {
        $owner = $request->user()->vehicleOwner;
        abort_if(! $owner, 422, 'Owner profile not found.');

        $vehicleIds = $owner->vehicles()->pluck('id');
        abort_if(! $vehicleIds->contains($alert->vehicle_id), 403, 'Access denied.');

        $alert->update(['resolved_at' => now()]);
        $alert->load('vehicle:id,number_plate');

        return new AlertResource($alert);
    }
}

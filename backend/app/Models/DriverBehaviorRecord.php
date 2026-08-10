<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverBehaviorRecord extends Model
{
    protected $fillable = ['trip_id', 'driver_id', 'vehicle_id', 'event_type', 'severity', 'recorded_at'];

    protected $casts = [
        'recorded_at' => 'datetime',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

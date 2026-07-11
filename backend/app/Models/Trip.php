<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    protected $fillable = ['vehicle_id', 'driver_id', 'start_time', 'end_time', 'distance_km', 'status'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
    public function gpsLogs()
    {
        return $this->hasMany(GpsLog::class);
    }
    public function passengerCounts()
    {
        return $this->hasMany(PassengerCount::class);
    }
    public function behaviorRecords()
    {
        return $this->hasMany(DriverBehaviorRecord::class);
    }
}

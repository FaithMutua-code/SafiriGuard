<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = ['user_id', 'sacco_id', 'vehicle_owner_id', 'license_number', 'license_expiry', 'safety_score'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function sacco()
    {
        return $this->belongsTo(Sacco::class);
    }
    public function vehicleOwner()
    {
        return $this->belongsTo(VehicleOwner::class);
    }
    public function vehicle()
    {
        return $this->hasOne(Vehicle::class);
    }
    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
    public function behaviorRecords()
    {
        return $this->hasMany(DriverBehaviorRecord::class);
    }
}

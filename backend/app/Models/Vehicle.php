<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['vehicle_owner_id', 'sacco_id', 'driver_id', 'number_plate', 'make', 'model', 'year', 'esp32_device_id', 'mpu6050_device_id'];

    public function owner()
    {
        return $this->belongsTo(VehicleOwner::class, 'vehicle_owner_id');
    }
    public function sacco()
    {
        return $this->belongsTo(Sacco::class);
    }
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vehicle extends Model
{
    protected $fillable = [
        'vehicle_owner_id', 'number_plate', 'make', 'model',
        'year', 'seat_capacity', 'fare_amount', 'route_name',
    ];

    protected $casts = [
        'fare_amount'   => 'decimal:2',
        'seat_capacity' => 'integer',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(VehicleOwner::class, 'vehicle_owner_id');
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function gpsLogs(): HasMany
    {
        return $this->hasMany(GpsLog::class);
    }

    public function passengerCounts(): HasMany
    {
        return $this->hasMany(PassengerCount::class);
    }

    public function drivingEvents(): HasMany
    {
        return $this->hasMany(DrivingEvent::class);
    }

    public function iotDevices(): HasMany
    {
        return $this->hasMany(IotDevice::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function latestGpsLog(): HasOne
    {
        return $this->hasOne(GpsLog::class)->latestOfMany('recorded_at');
    }

    public function latestPassengerCount(): HasOne
    {
        return $this->hasOne(PassengerCount::class)->latestOfMany('recorded_at');
    }
}

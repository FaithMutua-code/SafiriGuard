<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DrivingEvent extends Model
{
    protected $table = 'driving_events';

    public const VALID_TYPES = [
        'harsh_braking',
        'sudden_acceleration',
        'sharp_cornering',
    ];

    protected $fillable = [
        'vehicle_id', 'trip_id', 'type', 'severity',
        'latitude', 'longitude', 'recorded_at',
    ];

    protected $casts = [
        'severity'    => 'integer',
        'latitude'    => 'decimal:7',
        'longitude'   => 'decimal:7',
        'recorded_at' => 'datetime',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}

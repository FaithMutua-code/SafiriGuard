<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PassengerCount extends Model
{
    protected $fillable = [
        'vehicle_id', 'trip_id', 'people', 'recorded_at',
    ];

    protected $casts = [
        'people'      => 'integer',
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

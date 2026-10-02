<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Trip extends Model
{
    protected $fillable = [
        'vehicle_id', 'started_at', 'ended_at',
        'distance_km', 'boardings_estimate', 'revenue_estimate',
    ];

    protected $casts = [
        'started_at'        => 'datetime',
        'ended_at'          => 'datetime',
        'distance_km'       => 'decimal:2',
        'revenue_estimate'  => 'decimal:2',
        'boardings_estimate' => 'integer',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
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

    public function scopeOngoing(Builder $q): Builder
    {
        return $q->whereNull('ended_at');
    }

    public function scopeCompleted(Builder $q): Builder
    {
        return $q->whereNotNull('ended_at');
    }

    public function getIsOngoingAttribute(): bool
    {
        return $this->ended_at === null;
    }

    public function getDurationMinutesAttribute(): ?float
    {
        if (! $this->started_at) {
            return null;
        }
        $end = $this->ended_at ?? now();
        return round($this->started_at->diffInSeconds($end) / 60, 1);
    }
}

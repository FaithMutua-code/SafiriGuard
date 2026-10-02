<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    public const VALID_TYPES = [
        'harsh_braking',
        'sudden_acceleration',
        'sharp_cornering',
        'speeding',
        'device_offline',
        'over_capacity',
    ];

    public const SEVERITY_LEVELS = ['critical', 'warning', 'info'];

    public const SUGGESTED_ACTIONS = [
        'harsh_braking'       => 'Review driving patterns and consider speed reduction on this route.',
        'sudden_acceleration' => 'Encourage smoother acceleration to improve safety and fuel economy.',
        'sharp_cornering'     => 'Advise caution on corners; check if route has sharp turns.',
        'speeding'            => 'Monitor speed limits; consider setting a speed alert threshold.',
        'device_offline'      => 'Check device power supply and cellular/WiFi connectivity.',
        'over_capacity'       => 'Reduce passenger count to legal seat capacity immediately.',
    ];

    protected $fillable = [
        'vehicle_id', 'type', 'severity', 'description',
        'suggested_action', 'latitude', 'longitude', 'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'latitude'    => 'decimal:7',
        'longitude'   => 'decimal:7',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->whereNull('resolved_at');
    }

    public function scopeResolved(Builder $q): Builder
    {
        return $q->whereNotNull('resolved_at');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IotDevice extends Model
{
    protected $fillable = [
        'vehicle_id', 'name', 'api_key', 'last_seen_at',
    ];

    protected $hidden = ['api_key'];

    protected $casts = [
        'last_seen_at' => 'datetime',
    ];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Mutator: hash the API key on set using SHA-256 for fast DB lookups.
     */
    public function setApiKeyAttribute(string $value): void
    {
        $this->attributes['api_key'] = hash('sha256', $value);
    }

    /**
     * Look up a device by its plain-text API key.
     */
    public static function findByApiKey(string $plainKey): ?self
    {
        return static::where('api_key', hash('sha256', $plainKey))->first();
    }
}

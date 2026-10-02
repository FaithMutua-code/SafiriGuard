<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    // Roles: 'admin' | 'vehicle_owner' | 'sacco_manager' | 'driver'
    protected $fillable = ['name', 'email', 'phone', 'password', 'role', 'is_active'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }



    public function vehicleOwner()
    {
        return $this->hasOne(VehicleOwner::class);
    }

    public function driver()
    {
        return $this->hasOne(Driver::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function pushTokens()
    {
        return $this->hasMany(PushToken::class);
    }
}


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// app/Models/Sacco.php
class Sacco extends Model
{
    protected $fillable = ['name', 'contact_email', 'contact_phone', 'address'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
    public function vehicleOwners()
    {
        return $this->hasMany(VehicleOwner::class);
    }
    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}

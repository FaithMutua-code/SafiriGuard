<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleOwner extends Model
{
    protected $fillable = ['user_id', 'sacco_id', 'id_number', 'next_of_kin'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function sacco()
    {
        return $this->belongsTo(Sacco::class);
    }
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }
}

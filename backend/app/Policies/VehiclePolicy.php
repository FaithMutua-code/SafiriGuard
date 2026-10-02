<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;

class VehiclePolicy
{
    public function view(User $user, Vehicle $vehicle): bool
    {
        return $user->vehicleOwner
            && $vehicle->vehicle_owner_id === $user->vehicleOwner->id;
    }

    public function update(User $user, Vehicle $vehicle): bool
    {
        return $this->view($user, $vehicle);
    }

    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $this->view($user, $vehicle);
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@safariguard.co.ke'],
            [
                'name'      => 'SafariGuard Admin',
                'email'     => 'admin@safariguard.co.ke',
                'phone'     => '+254700000000',
                'password'  => Hash::make('Admin@1234'),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        $this->command->info('✅ Admin account created: admin@safariguard.co.ke / Admin@1234');
    }
}

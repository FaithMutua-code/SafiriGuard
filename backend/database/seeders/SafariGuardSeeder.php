<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\DrivingEvent;
use App\Models\GpsLog;
use App\Models\IotDevice;
use App\Models\PassengerCount;
use App\Models\PushToken;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleOwner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class SafariGuardSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or get Vehicle Owner
        $ownerUser = User::firstOrCreate(
            ['email' => 'owner@safariguard.com'],
            [
                'name'      => 'Faith Mutua',
                'phone'     => '+254712345678',
                'password'  => Hash::make('password123'),
                'role'      => 'vehicle_owner',
                'is_active' => true,
            ]
        );

        $owner = VehicleOwner::firstOrCreate(
            ['user_id' => $ownerUser->id],
            [
                'id_number'   => '12345678',
                'next_of_kin' => 'John Mutua (+254722000000)',
            ]
        );

        // Push token for owner
        PushToken::firstOrCreate(
            ['user_id' => $ownerUser->id, 'token' => 'ExponentPushToken[safariguard-sample-token-12345]'],
            ['platform' => 'android']
        );

        // 2. Create Vehicles
        $vehiclesData = [
            [
                'number_plate'  => 'KCA 123A',
                'make'          => 'Toyota',
                'model'         => 'Hiace (Shark)',
                'year'          => 2020,
                'seat_capacity' => 14,
                'fare_amount'   => 100.00,
                'route_name'    => 'Route 111: CBD - Ngong',
            ],
            [
                'number_plate'  => 'KDB 456B',
                'make'          => 'Isuzu',
                'model'         => 'NQR 33-Seater',
                'year'          => 2022,
                'seat_capacity' => 33,
                'fare_amount'   => 150.00,
                'route_name'    => 'Route 24: CBD - Karen',
            ],
            [
                'number_plate'  => 'KDA 789C',
                'make'          => 'Toyota',
                'model'         => 'Hiace Super Custom',
                'year'          => 2018,
                'seat_capacity' => 14,
                'fare_amount'   => 80.00,
                'route_name'    => 'Route 44: CBD - Kahawa West',
            ],
        ];

        $vehicles = [];
        foreach ($vehiclesData as $vData) {
            $vehicle = Vehicle::firstOrCreate(
                ['number_plate' => $vData['number_plate']],
                array_merge($vData, ['vehicle_owner_id' => $owner->id])
            );
            $vehicles[] = $vehicle;

            // IoT Device for each vehicle
            IotDevice::firstOrCreate(
                ['vehicle_id' => $vehicle->id],
                [
                    'name'         => "ESP32-CAM-{$vehicle->number_plate}",
                    'api_key'      => "dev_key_{$vehicle->id}_secret",
                    'last_seen_at' => Carbon::now(),
                ]
            );
        }

        // 3. Seed 14 Days of History (Past 13 days up to yesterday)
        $nairobiBaseLat = -1.286389;
        $nairobiBaseLng = 36.821944;

        for ($dayOffset = 13; $dayOffset >= 1; $dayOffset--) {
            $day = Carbon::now()->subDays($dayOffset);

            foreach ($vehicles as $vIndex => $vehicle) {
                // Generate 2-4 trips per vehicle per day
                $tripCount = ($vIndex === 0) ? 4 : (($vIndex === 1) ? 3 : 2);

                for ($t = 0; $t < $tripCount; $t++) {
                    $startHour = 6 + ($t * 3) + ($vIndex * 1);
                    $tripStart = $day->copy()->setHour($startHour)->setMinute(15 + ($t * 5))->setSecond(0);
                    $durationMin = rand(40, 75);
                    $tripEnd = $tripStart->copy()->addMinutes($durationMin);
                    $distance = round(rand(180, 260) / 10, 2); // 18.0 - 26.0 km

                    // Boardings estimation
                    $boardings = rand(15, 28);
                    $revenue = $boardings * (float) $vehicle->fare_amount;

                    $trip = Trip::create([
                        'vehicle_id'         => $vehicle->id,
                        'started_at'         => $tripStart,
                        'ended_at'           => $tripEnd,
                        'distance_km'        => $distance,
                        'boardings_estimate' => $boardings,
                        'revenue_estimate'   => $revenue,
                    ]);

                    // Seed GPS logs for this trip
                    $pointsCount = 6;
                    for ($p = 0; $p < $pointsCount; $p++) {
                        $pTime = $tripStart->copy()->addMinutes(intval($durationMin * ($p / ($pointsCount - 1))));
                        $latOffset = ($p * 0.008) * (($p % 2 == 0) ? 1 : -1);
                        $lngOffset = ($p * 0.009);
                        $speed = ($p == 0 || $p == $pointsCount - 1) ? 0.0 : rand(25, 65);

                        GpsLog::create([
                            'vehicle_id'  => $vehicle->id,
                            'trip_id'     => $trip->id,
                            'latitude'    => round($nairobiBaseLat + $latOffset, 7),
                            'longitude'   => round($nairobiBaseLng + $lngOffset, 7),
                            'speed'       => $speed,
                            'recorded_at' => $pTime,
                        ]);
                    }

                    // Seed Passenger Counts
                    PassengerCount::create([
                        'vehicle_id'  => $vehicle->id,
                        'trip_id'     => $trip->id,
                        'people'      => min($vehicle->seat_capacity, rand(6, 10)),
                        'recorded_at' => $tripStart->copy()->addMinutes(5),
                    ]);
                    PassengerCount::create([
                        'vehicle_id'  => $vehicle->id,
                        'trip_id'     => $trip->id,
                        'people'      => min($vehicle->seat_capacity, rand(10, $vehicle->seat_capacity)),
                        'recorded_at' => $tripStart->copy()->addMinutes(intval($durationMin / 2)),
                    ]);

                    // Occasional driving event (about 1 in 3 trips)
                    if (rand(1, 3) === 1) {
                        $eventTypes = ['harsh_braking', 'sudden_acceleration', 'sharp_cornering'];
                        $eType = $eventTypes[array_rand($eventTypes)];
                        $sev = rand(1, 2);
                        $eTime = $tripStart->copy()->addMinutes(rand(10, $durationMin - 10));

                        $event = DrivingEvent::create([
                            'vehicle_id'  => $vehicle->id,
                            'trip_id'     => $trip->id,
                            'type'        => $eType,
                            'severity'    => $sev,
                            'latitude'    => round($nairobiBaseLat + 0.015, 7),
                            'longitude'   => round($nairobiBaseLng + 0.020, 7),
                            'recorded_at' => $eTime,
                        ]);

                        // Resolved alert for historical events
                        Alert::create([
                            'vehicle_id'       => $vehicle->id,
                            'type'             => $eType,
                            'severity'         => ($sev === 3) ? 'critical' : (($sev === 2) ? 'warning' : 'info'),
                            'description'      => ucfirst(str_replace('_', ' ', $eType)) . " detected on {$vehicle->route_name}.",
                            'suggested_action' => Alert::SUGGESTED_ACTIONS[$eType] ?? null,
                            'latitude'         => $event->latitude,
                            'longitude'        => $event->longitude,
                            'resolved_at'      => $tripEnd,
                            'created_at'       => $eTime,
                        ]);
                    }
                }
            }
        }

        // 4. Seed Today's Realistic Data
        $today = Carbon::today();

        // Vehicle 0: KCA 123A (ACTIVE today: 1 completed trip + 1 ongoing trip right now)
        $v1 = $vehicles[0];
        $v1Trip1Start = $today->copy()->setHour(7)->setMinute(30);
        $v1Trip1End = $v1Trip1Start->copy()->addMinutes(50);
        Trip::create([
            'vehicle_id'         => $v1->id,
            'started_at'         => $v1Trip1Start,
            'ended_at'           => $v1Trip1End,
            'distance_km'        => 22.40,
            'boardings_estimate' => 20,
            'revenue_estimate'   => 2000.00,
        ]);

        // Ongoing trip right now
        $v1OngoingStart = Carbon::now()->subMinutes(25);
        $v1Ongoing = Trip::create([
            'vehicle_id'         => $v1->id,
            'started_at'         => $v1OngoingStart,
            'ended_at'           => null, // ongoing!
            'distance_km'        => 12.80,
            'boardings_estimate' => 14,
            'revenue_estimate'   => 1400.00,
        ]);

        // Recent GPS logs showing moving speed for active status
        GpsLog::create([
            'vehicle_id'  => $v1->id,
            'trip_id'     => $v1Ongoing->id,
            'latitude'    => -1.301900,
            'longitude'   => 36.784200,
            'speed'       => 45.0,
            'recorded_at' => Carbon::now()->subSeconds(30),
        ]);
        PassengerCount::create([
            'vehicle_id'  => $v1->id,
            'trip_id'     => $v1Ongoing->id,
            'people'      => 9,
            'recorded_at' => Carbon::now()->subMinutes(5),
        ]);

        // Today's driving event on v1
        $todayEventTime = Carbon::now()->subMinutes(12);
        DrivingEvent::create([
            'vehicle_id'  => $v1->id,
            'trip_id'     => $v1Ongoing->id,
            'type'        => 'harsh_braking',
            'severity'    => 2,
            'latitude'    => -1.300500,
            'longitude'   => 36.775000,
            'recorded_at' => $todayEventTime,
        ]);
        // Active alert for this harsh braking
        Alert::create([
            'vehicle_id'       => $v1->id,
            'type'             => 'harsh_braking',
            'severity'         => 'warning',
            'description'      => 'Harsh braking detected near Adams Arcade (Ngong Rd).',
            'suggested_action' => Alert::SUGGESTED_ACTIONS['harsh_braking'],
            'latitude'         => -1.300500,
            'longitude'        => 36.775000,
            'resolved_at'      => null, // ACTIVE!
            'created_at'       => $todayEventTime,
        ]);

        // Update v1 IoT device to online right now
        $v1->iotDevices()->update(['last_seen_at' => Carbon::now()->subSeconds(20)]);

        // Vehicle 1: KDB 456B (IDLE today: 2 completed morning trips, parked at stage)
        $v2 = $vehicles[1];
        $v2Trip1Start = $today->copy()->setHour(6)->setMinute(45);
        Trip::create([
            'vehicle_id'         => $v2->id,
            'started_at'         => $v2Trip1Start,
            'ended_at'           => $v2Trip1Start->copy()->addMinutes(60),
            'distance_km'        => 28.50,
            'boardings_estimate' => 38,
            'revenue_estimate'   => 5700.00,
        ]);
        $v2Trip2Start = $today->copy()->setHour(9)->setMinute(15);
        Trip::create([
            'vehicle_id'         => $v2->id,
            'started_at'         => $v2Trip2Start,
            'ended_at'           => $v2Trip2Start->copy()->addMinutes(55),
            'distance_km'        => 26.20,
            'boardings_estimate' => 32,
            'revenue_estimate'   => 4800.00,
        ]);
        // Parked at stage: speed 0.0
        GpsLog::create([
            'vehicle_id'  => $v2->id,
            'trip_id'     => null,
            'latitude'    => -1.319700,
            'longitude'   => 36.706500,
            'speed'       => 0.0,
            'recorded_at' => Carbon::now()->subMinutes(1),
        ]);
        PassengerCount::create([
            'vehicle_id'  => $v2->id,
            'trip_id'     => null,
            'people'      => 0,
            'recorded_at' => Carbon::now()->subMinutes(1),
        ]);
        $v2->iotDevices()->update(['last_seen_at' => Carbon::now()->subMinutes(1)]);

        // Vehicle 2: KDA 789C (OFFLINE today: device stopped communicating 45 mins ago)
        $v3 = $vehicles[2];
        $v3->iotDevices()->update(['last_seen_at' => Carbon::now()->subMinutes(45)]);
        GpsLog::create([
            'vehicle_id'  => $v3->id,
            'trip_id'     => null,
            'latitude'    => -1.250000,
            'longitude'   => 36.850000,
            'speed'       => 0.0,
            'recorded_at' => Carbon::now()->subMinutes(45),
        ]);
        PassengerCount::create([
            'vehicle_id'  => $v3->id,
            'trip_id'     => null,
            'people'      => 0,
            'recorded_at' => Carbon::now()->subMinutes(45),
        ]);
        // Active critical alert for offline device
        Alert::create([
            'vehicle_id'       => $v3->id,
            'type'             => 'device_offline',
            'severity'         => 'critical',
            'description'      => 'Device has been offline for over 45 minutes.',
            'suggested_action' => Alert::SUGGESTED_ACTIONS['device_offline'],
            'latitude'         => -1.250000,
            'longitude'        => 36.850000,
            'resolved_at'      => null, // ACTIVE!
            'created_at'       => Carbon::now()->subMinutes(43),
        ]);
    }
}

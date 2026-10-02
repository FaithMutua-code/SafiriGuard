<?php

namespace App\Console\Commands;

use App\Models\IotDevice;
use App\Models\Vehicle;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class SimulateDeviceCommand extends Command
{
    protected $signature = 'safariguard:simulate {vehicle_id : The ID of the vehicle to simulate} {--fast : Run simulation quickly without sleep pauses}';

    protected $description = 'Simulate realistic IoT telemetry (GPS, occupancy, driving events) for a vehicle';

    public function handle(): int
    {
        $vehicleId = $this->argument('vehicle_id');
        $vehicle = Vehicle::find($vehicleId);

        if (! $vehicle) {
            $this->error("Vehicle with ID {$vehicleId} not found.");
            return 1;
        }

        // Find or create IoT device with known API key
        $device = $vehicle->iotDevices()->first();
        $plainKey = 'sim_device_key_' . $vehicle->id;

        if (! $device) {
            $device = IotDevice::create([
                'vehicle_id' => $vehicle->id,
                'name'       => "ESP32-{$vehicle->number_plate}",
                'api_key'    => $plainKey,
            ]);
            $this->info("Created new IoT device for vehicle {$vehicle->number_plate}. Key: {$plainKey}");
        } else {
            // Update device key so we know the plain key for X-Device-Key header
            $device->api_key = $plainKey;
            $device->save();
        }

        $routeName = $vehicle->route_name ?? 'Nairobi Loop';
        $this->info("Starting telemetry simulation for [{$vehicle->number_plate}] ({$routeName})...");
        $this->line("Capacity: {$vehicle->seat_capacity} pax | Fare: KES {$vehicle->fare_amount}");

        // Waypoints along a real Nairobi route (CBD -> Ngong Rd -> Junction -> Karen -> CBD)
        $routePoints = [
            ['lat' => -1.286389, 'lng' => 36.821944, 'speed' => 0.0,  'stop' => true,  'pax' => 6],   // CBD Stage
            ['lat' => -1.288500, 'lng' => 36.819000, 'speed' => 15.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.293000, 'lng' => 36.815500, 'speed' => 35.0, 'stop' => false, 'pax' => null], // Haile Selassie
            ['lat' => -1.297500, 'lng' => 36.814200, 'speed' => 42.0, 'stop' => false, 'pax' => null, 'event' => ['type' => 'sudden_acceleration', 'severity' => 2]], // Upper Hill
            ['lat' => -1.301200, 'lng' => 36.807800, 'speed' => 28.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.301900, 'lng' => 36.784200, 'speed' => 0.0,  'stop' => true,  'pax' => min($vehicle->seat_capacity, 11)], // Adams Arcade stop
            ['lat' => -1.300500, 'lng' => 36.775000, 'speed' => 48.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.299500, 'lng' => 36.768000, 'speed' => 52.0, 'stop' => false, 'pax' => null, 'event' => ['type' => 'harsh_braking', 'severity' => 2]], // Ngong Rd
            ['lat' => -1.298900, 'lng' => 36.762800, 'speed' => 0.0,  'stop' => true,  'pax' => min($vehicle->seat_capacity, 8)],  // Junction Mall stop
            ['lat' => -1.305000, 'lng' => 36.745000, 'speed' => 55.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.312000, 'lng' => 36.725000, 'speed' => 62.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.319700, 'lng' => 36.706500, 'speed' => 22.0, 'stop' => false, 'pax' => null, 'event' => ['type' => 'sharp_cornering', 'severity' => 1]], // Karen Roundabout
            ['lat' => -1.321000, 'lng' => 36.708000, 'speed' => 0.0,  'stop' => true,  'pax' => min($vehicle->seat_capacity, 4)],  // Karen Stage
            ['lat' => -1.318000, 'lng' => 36.735000, 'speed' => 58.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.310000, 'lng' => 36.775000, 'speed' => 65.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.295000, 'lng' => 36.805000, 'speed' => 40.0, 'stop' => false, 'pax' => null],
            ['lat' => -1.286389, 'lng' => 36.821944, 'speed' => 0.0,  'stop' => true,  'pax' => 0],  // Return to CBD
        ];

        $currentTime = Carbon::now()->subMinutes(count($routePoints) * 2 + 10);
        $totalSent = 0;

        foreach ($routePoints as $idx => $pt) {
            $currentTime = $currentTime->copy()->addMinutes(2);

            $payload = [
                'gps' => [
                    [
                        'lat'   => $pt['lat'],
                        'lng'   => $pt['lng'],
                        'speed' => $pt['speed'],
                        'ts'    => $currentTime->toIso8601String(),
                    ],
                ],
            ];

            if ($pt['stop'] && $pt['pax'] !== null) {
                $payload['occupancy'] = [
                    'people' => $pt['pax'],
                    'ts'     => $currentTime->toIso8601String(),
                ];
            }

            if (! empty($pt['event'])) {
                $payload['events'] = [
                    [
                        'type'     => $pt['event']['type'],
                        'severity' => $pt['event']['severity'],
                        'lat'      => $pt['lat'],
                        'lng'      => $pt['lng'],
                        'ts'       => $currentTime->toIso8601String(),
                    ],
                ];
            }

            // Post telemetry through the SAME HTTP pipeline
            $response = $this->dispatchTelemetry($plainKey, $payload);

            if ($response->getStatusCode() === 202) {
                $statusMsg = "Step " . ($idx + 1) . "/" . count($routePoints) . " sent: speed={$pt['speed']}km/h";
                if ($pt['stop']) {
                    $statusMsg .= ", pax={$pt['pax']}";
                }
                if (! empty($pt['event'])) {
                    $statusMsg .= ", event={$pt['event']['type']} (sev {$pt['event']['severity']})";
                }
                $this->line("  ✓ {$statusMsg}");
                $totalSent++;
            } else {
                $this->warn("  ✗ Telemetry step failed: " . $response->getContent());
            }

            if (! $this->option('fast')) {
                usleep(200000); // 200ms delay for console readability
            }
        }

        // Simulate short stationary period to end the trip (>5 minutes with speed 0)
        $endTime = $currentTime->copy()->addMinutes(6);
        $finalPayload = [
            'gps' => [
                [
                    'lat'   => -1.286389,
                    'lng'   => 36.821944,
                    'speed' => 0.0,
                    'ts'    => $endTime->toIso8601String(),
                ],
            ],
            'occupancy' => [
                'people' => 0,
                'ts'     => $endTime->toIso8601String(),
            ],
        ];
        $this->dispatchTelemetry($plainKey, $finalPayload);

        $this->info("Simulation completed! Sent {$totalSent} telemetry payloads through POST /api/device/telemetry.");
        $this->line("Vehicle [{$vehicle->number_plate}] now has real trip, GPS logs, passenger counts, and event records.");

        return 0;
    }

    private function dispatchTelemetry(string $deviceKey, array $payload)
    {
        $request = Request::create(
            '/api/device/telemetry',
            'POST',
            [],
            [],
            [],
            [
                'HTTP_X_DEVICE_KEY' => $deviceKey,
                'HTTP_ACCEPT'       => 'application/json',
                'CONTENT_TYPE'      => 'application/json',
            ],
            json_encode($payload)
        );

        return app()->handle($request);
    }
}

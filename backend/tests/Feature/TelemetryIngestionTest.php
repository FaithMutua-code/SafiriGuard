<?php

namespace Tests\Feature;

use App\Models\DrivingEvent;
use App\Models\GpsLog;
use App\Models\IotDevice;
use App\Models\PassengerCount;
use App\Models\Vehicle;
use App\Models\VehicleOwner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelemetryIngestionTest extends TestCase
{
    use RefreshDatabase;

    private Vehicle $vehicle;
    private IotDevice $device;
    private string $deviceKey = 'secret_test_key_123';

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::factory()->create(['role' => 'vehicle_owner']);
        $owner = VehicleOwner::create(['user_id' => $user->id, 'id_number' => '88889999']);
        $this->vehicle = Vehicle::create([
            'vehicle_owner_id' => $owner->id,
            'number_plate'     => 'KAA 001X',
            'make'             => 'Toyota',
            'model'            => 'Hiace',
            'year'             => 2020,
            'seat_capacity'    => 14,
            'fare_amount'      => 100.00,
            'route_name'       => 'CBD - Ngong',
        ]);

        $this->device = IotDevice::create([
            'vehicle_id' => $this->vehicle->id,
            'name'       => 'Test ESP32',
            'api_key'    => $this->deviceKey,
        ]);
    }

    public function test_rejects_telemetry_without_device_key(): void
    {
        $response = $this->postJson('/api/device/telemetry', [
            'gps' => [['lat' => -1.28, 'lng' => 36.82, 'speed' => 20, 'ts' => now()->toIso8601String()]],
        ]);

        $response->assertStatus(401);
    }

    public function test_rejects_telemetry_with_invalid_device_key(): void
    {
        $response = $this->withHeader('X-Device-Key', 'wrong_key')
            ->postJson('/api/device/telemetry', [
                'gps' => [['lat' => -1.28, 'lng' => 36.82, 'speed' => 20, 'ts' => now()->toIso8601String()]],
            ]);

        $response->assertStatus(401);
    }

    public function test_ingests_valid_telemetry_and_records_data(): void
    {
        $now = now();
        $payload = [
            'gps' => [
                ['lat' => -1.286389, 'lng' => 36.821944, 'speed' => 35.5, 'ts' => $now->toIso8601String()],
            ],
            'occupancy' => [
                'people' => 10,
                'ts'     => $now->toIso8601String(),
            ],
            'events' => [
                [
                    'type'     => 'harsh_braking',
                    'severity' => 2,
                    'lat'      => -1.286389,
                    'lng'      => 36.821944,
                    'ts'       => $now->toIso8601String(),
                ],
            ],
        ];

        $response = $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', $payload);

        $response->assertStatus(202)
            ->assertJson(['message' => 'Telemetry processed']);

        $this->assertDatabaseHas('gps_logs', [
            'vehicle_id' => $this->vehicle->id,
            'speed'      => 35.5,
        ]);

        $this->assertDatabaseHas('passenger_counts', [
            'vehicle_id' => $this->vehicle->id,
            'people'     => 10,
        ]);

        $this->assertDatabaseHas('driving_events', [
            'vehicle_id' => $this->vehicle->id,
            'type'       => 'harsh_braking',
            'severity'   => 2,
        ]);

        $this->assertDatabaseHas('iot_devices', [
            'id' => $this->device->id,
        ]);
    }

    public function test_validates_gps_required_fields(): void
    {
        $response = $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps' => [
                    ['lat' => 'not-a-number', 'lng' => 36.82, 'speed' => -5, 'ts' => 'invalid-date'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['gps.0.lat', 'gps.0.speed', 'gps.0.ts']);
    }

    public function test_validates_event_types(): void
    {
        $response = $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps' => [['lat' => -1.28, 'lng' => 36.82, 'speed' => 20, 'ts' => now()->toIso8601String()]],
                'events' => [
                    ['type' => 'unknown_event_type', 'severity' => 5, 'lat' => -1.28, 'lng' => 36.82, 'ts' => now()->toIso8601String()],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['events.0.type', 'events.0.severity']);
    }
}

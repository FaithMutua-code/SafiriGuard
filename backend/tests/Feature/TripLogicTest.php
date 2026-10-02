<?php

namespace Tests\Feature;

use App\Models\IotDevice;
use App\Models\Trip;
use App\Models\Vehicle;
use App\Models\VehicleOwner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class TripLogicTest extends TestCase
{
    use RefreshDatabase;

    private Vehicle $vehicle;
    private string $deviceKey = 'trip_test_key';

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::factory()->create(['role' => 'vehicle_owner']);
        $owner = VehicleOwner::create(['user_id' => $user->id, 'id_number' => '11223344']);
        $this->vehicle = Vehicle::create([
            'vehicle_owner_id' => $owner->id,
            'number_plate'     => 'KBB 002Y',
            'make'             => 'Toyota',
            'model'            => 'Hiace',
            'year'             => 2021,
            'seat_capacity'    => 14,
            'fare_amount'      => 100.00,
            'route_name'       => 'Route 111',
        ]);

        IotDevice::create([
            'vehicle_id' => $this->vehicle->id,
            'name'       => 'Tracker',
            'api_key'    => $this->deviceKey,
        ]);
    }

    public function test_trip_starts_when_speed_exceeds_5_kmh(): void
    {
        $this->assertEquals(0, Trip::count());

        // Stationary telemetry: speed 0
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps' => [['lat' => -1.2863, 'lng' => 36.8219, 'speed' => 0.0, 'ts' => now()->toIso8601String()]],
            ])->assertStatus(202);

        $this->assertEquals(0, Trip::count(), 'Trip should not start when vehicle is stationary');

        // Speed increases to 15 km/h: trip starts!
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps' => [['lat' => -1.2900, 'lng' => 36.8150, 'speed' => 15.0, 'ts' => now()->toIso8601String()]],
            ])->assertStatus(202);

        $this->assertEquals(1, Trip::count(), 'Trip should start when speed > 5 km/h');
        $trip = Trip::first();
        $this->assertTrue($trip->is_ongoing);
        $this->assertNull($trip->ended_at);
    }

    public function test_boardings_and_revenue_estimates_accumulate(): void
    {
        $start = Carbon::now()->subMinutes(20);

        // Start trip with 4 people
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps'       => [['lat' => -1.2863, 'lng' => 36.8219, 'speed' => 25.0, 'ts' => $start->toIso8601String()]],
                'occupancy' => ['people' => 4, 'ts' => $start->toIso8601String()],
            ])->assertStatus(202);

        $trip = Trip::first();
        $this->assertEquals(4, $trip->fresh()->boardings_estimate);
        $this->assertEquals(400.00, (float) $trip->fresh()->revenue_estimate);

        // Passengers board: headcount increases from 4 to 10 (+6)
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps'       => [['lat' => -1.2950, 'lng' => 36.8100, 'speed' => 30.0, 'ts' => $start->copy()->addMinutes(5)->toIso8601String()]],
                'occupancy' => ['people' => 10, 'ts' => $start->copy()->addMinutes(5)->toIso8601String()],
            ])->assertStatus(202);

        $this->assertEquals(10, $trip->fresh()->boardings_estimate);
        $this->assertEquals(1000.00, (float) $trip->fresh()->revenue_estimate);

        // Passengers alight: headcount decreases from 10 to 6 (no new boardings)
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps'       => [['lat' => -1.3000, 'lng' => 36.8000, 'speed' => 20.0, 'ts' => $start->copy()->addMinutes(10)->toIso8601String()]],
                'occupancy' => ['people' => 6, 'ts' => $start->copy()->addMinutes(10)->toIso8601String()],
            ])->assertStatus(202);

        $this->assertEquals(10, $trip->fresh()->boardings_estimate, 'Alighting should not decrease boardings');
        $this->assertEquals(1000.00, (float) $trip->fresh()->revenue_estimate);
    }
}

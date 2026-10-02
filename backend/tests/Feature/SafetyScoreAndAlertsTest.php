<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\IotDevice;
use App\Models\Trip;
use App\Models\Vehicle;
use App\Models\VehicleOwner;
use App\Models\User;
use App\Services\TelemetryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SafetyScoreAndAlertsTest extends TestCase
{
    use RefreshDatabase;

    private Vehicle $vehicle;
    private string $deviceKey = 'safety_test_key';
    private TelemetryService $telemetryService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->telemetryService = app(TelemetryService::class);

        $user = User::factory()->create(['role' => 'vehicle_owner']);
        $owner = VehicleOwner::create(['user_id' => $user->id, 'id_number' => '55667788']);
        $this->vehicle = Vehicle::create([
            'vehicle_owner_id' => $owner->id,
            'number_plate'     => 'KCC 003Z',
            'make'             => 'Toyota',
            'model'            => 'Hiace',
            'year'             => 2021,
            'seat_capacity'    => 14,
            'fare_amount'      => 100.00,
            'route_name'       => 'CBD - Westlands',
        ]);

        IotDevice::create([
            'vehicle_id' => $this->vehicle->id,
            'name'       => 'Tracker',
            'api_key'    => $this->deviceKey,
        ]);
    }

    public function test_safety_score_is_null_when_no_distance(): void
    {
        $score = $this->telemetryService->getSafetyScore($this->vehicle);
        $this->assertNull($score);
    }

    public function test_safety_score_computes_from_distance_and_severity(): void
    {
        // 100 km completed trip with 0 events = score 100
        Trip::create([
            'vehicle_id'  => $this->vehicle->id,
            'started_at'  => now()->subHours(3),
            'ended_at'    => now()->subHour(),
            'distance_km' => 100.00,
        ]);

        $score = $this->telemetryService->getSafetyScore($this->vehicle);
        $this->assertEquals(100, $score);
    }

    public function test_events_generate_alerts_with_correct_severity_and_action(): void
    {
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps'    => [['lat' => -1.2863, 'lng' => 36.8219, 'speed' => 30.0, 'ts' => now()->toIso8601String()]],
                'events' => [
                    [
                        'type'     => 'harsh_braking',
                        'severity' => 3,
                        'lat'      => -1.2863,
                        'lng'      => 36.8219,
                        'ts'       => now()->toIso8601String(),
                    ],
                ],
            ])->assertStatus(202);

        $this->assertDatabaseHas('alerts', [
            'vehicle_id' => $this->vehicle->id,
            'type'       => 'harsh_braking',
            'severity'   => 'critical', // severity 3 maps to critical
        ]);

        $alert = Alert::first();
        $this->assertNotNull($alert->suggested_action);
        $this->assertEquals(Alert::SUGGESTED_ACTIONS['harsh_braking'], $alert->suggested_action);
    }

    public function test_speeding_exceeding_80_generates_speeding_alert(): void
    {
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps' => [['lat' => -1.2863, 'lng' => 36.8219, 'speed' => 95.0, 'ts' => now()->toIso8601String()]],
            ])->assertStatus(202);

        $this->assertDatabaseHas('alerts', [
            'vehicle_id' => $this->vehicle->id,
            'type'       => 'speeding',
            'severity'   => 'warning',
        ]);
    }

    public function test_over_capacity_generates_alert(): void
    {
        // Seat capacity is 14; send 18 people
        $this->withHeader('X-Device-Key', $this->deviceKey)
            ->postJson('/api/device/telemetry', [
                'gps'       => [['lat' => -1.2863, 'lng' => 36.8219, 'speed' => 20.0, 'ts' => now()->toIso8601String()]],
                'occupancy' => ['people' => 18, 'ts' => now()->toIso8601String()],
            ])->assertStatus(202);

        $this->assertDatabaseHas('alerts', [
            'vehicle_id' => $this->vehicle->id,
            'type'       => 'over_capacity',
            'severity'   => 'warning',
        ]);
    }
}

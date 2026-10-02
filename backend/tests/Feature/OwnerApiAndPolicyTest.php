<?php

namespace Tests\Feature;

use App\Models\Alert;
use App\Models\Trip;
use App\Models\Vehicle;
use App\Models\VehicleOwner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OwnerApiAndPolicyTest extends TestCase
{
    use RefreshDatabase;

    private User $ownerUser;
    private VehicleOwner $owner;
    private Vehicle $ownerVehicle;

    private User $otherUser;
    private VehicleOwner $otherOwner;
    private Vehicle $otherVehicle;

    protected function setUp(): void
    {
        parent::setUp();

        // Primary owner
        $this->ownerUser = User::factory()->create(['role' => 'vehicle_owner']);
        $this->owner = VehicleOwner::create(['user_id' => $this->ownerUser->id, 'id_number' => '10001000']);
        $this->ownerVehicle = Vehicle::create([
            'vehicle_owner_id' => $this->owner->id,
            'number_plate'     => 'KAA 111A',
            'make'             => 'Toyota',
            'model'            => 'Hiace',
            'year'             => 2020,
            'seat_capacity'    => 14,
            'fare_amount'      => 100.00,
            'route_name'       => 'Route 1',
        ]);

        // Other owner
        $this->otherUser = User::factory()->create(['role' => 'vehicle_owner']);
        $this->otherOwner = VehicleOwner::create(['user_id' => $this->otherUser->id, 'id_number' => '20002000']);
        $this->otherVehicle = Vehicle::create([
            'vehicle_owner_id' => $this->otherOwner->id,
            'number_plate'     => 'KBB 222B',
            'make'             => 'Isuzu',
            'model'            => 'NQR',
            'year'             => 2021,
            'seat_capacity'    => 33,
            'fare_amount'      => 150.00,
            'route_name'       => 'Route 2',
        ]);
    }

    public function test_owner_can_list_their_vehicles(): void
    {
        Sanctum::actingAs($this->ownerUser);

        $response = $this->getJson('/api/owner/vehicles');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.number_plate', 'KAA 111A');
    }

    public function test_owner_can_view_own_vehicle_overview(): void
    {
        Sanctum::actingAs($this->ownerUser);

        $response = $this->getJson("/api/owner/vehicles/{$this->ownerVehicle->id}/overview");

        $response->assertStatus(200)
            ->assertJsonPath('data.vehicle.number_plate', 'KAA 111A');
    }

    public function test_owner_cannot_access_other_owners_vehicle(): void
    {
        Sanctum::actingAs($this->ownerUser);

        $response = $this->getJson("/api/owner/vehicles/{$this->otherVehicle->id}/overview");

        $response->assertStatus(403);
    }

    public function test_owner_trips_returns_only_owner_vehicles_trips(): void
    {
        Trip::create([
            'vehicle_id'  => $this->ownerVehicle->id,
            'started_at'  => now()->subHour(),
            'distance_km' => 15.0,
        ]);
        Trip::create([
            'vehicle_id'  => $this->otherVehicle->id,
            'started_at'  => now()->subHour(),
            'distance_km' => 20.0,
        ]);

        Sanctum::actingAs($this->ownerUser);

        $response = $this->getJson('/api/owner/trips');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.vehicle_plate', 'KAA 111A');
    }

    public function test_owner_can_resolve_an_alert(): void
    {
        $alert = Alert::create([
            'vehicle_id'  => $this->ownerVehicle->id,
            'type'        => 'harsh_braking',
            'severity'    => 'warning',
            'description' => 'Test harsh braking',
        ]);

        Sanctum::actingAs($this->ownerUser);

        $response = $this->postJson("/api/owner/alerts/{$alert->id}/resolve");

        $response->assertStatus(200);
        $this->assertNotNull($alert->fresh()->resolved_at);
    }

    public function test_owner_can_register_and_delete_push_token(): void
    {
        Sanctum::actingAs($this->ownerUser);

        $response = $this->postJson('/api/owner/push-token', [
            'token'    => 'ExponentPushToken[unit-test-token]',
            'platform' => 'android',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('push_tokens', [
            'user_id' => $this->ownerUser->id,
            'token'   => 'ExponentPushToken[unit-test-token]',
        ]);

        // Delete push token
        $delResponse = $this->deleteJson('/api/owner/push-token', [
            'token' => 'ExponentPushToken[unit-test-token]',
        ]);
        $delResponse->assertStatus(204);
        $this->assertDatabaseMissing('push_tokens', [
            'token' => 'ExponentPushToken[unit-test-token]',
        ]);
    }

    public function test_owner_can_view_and_update_profile(): void
    {
        Sanctum::actingAs($this->ownerUser);

        // View profile
        $showRes = $this->getJson('/api/owner/profile');
        $showRes->assertStatus(200)
            ->assertJsonPath('user.id', $this->ownerUser->id);

        // Update profile
        $updateRes = $this->putJson('/api/owner/profile', [
            'name'      => 'Updated Owner Name',
            'phone'     => '+254712345678',
            'id_number' => '99887766',
        ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('user.name', 'Updated Owner Name')
            ->assertJsonPath('user.phone', '+254712345678')
            ->assertJsonPath('user.vehicle_owner.id_number', '99887766');

        $this->assertDatabaseHas('users', [
            'id'    => $this->ownerUser->id,
            'name'  => 'Updated Owner Name',
            'phone' => '+254712345678',
        ]);
        $this->assertDatabaseHas('vehicle_owners', [
            'user_id'   => $this->ownerUser->id,
            'id_number' => '99887766',
        ]);
    }
}

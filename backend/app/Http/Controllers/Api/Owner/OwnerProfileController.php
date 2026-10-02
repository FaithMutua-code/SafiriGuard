<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OwnerProfileController extends Controller
{
    /**
     * Get the authenticated owner's profile.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('vehicleOwner'),
        ]);
    }

    /**
     * Update the authenticated owner's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'phone'     => ['nullable', 'string', 'max:25'],
            'email'     => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'id_number' => ['nullable', 'string', 'max:50'],
        ]);

        $user->name = $validated['name'];
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        if (!empty($validated['email'])) {
            $user->email = $validated['email'];
        }
        $user->save();

        if (array_key_exists('id_number', $validated)) {
            if ($user->vehicleOwner) {
                $user->vehicleOwner->update(['id_number' => $validated['id_number']]);
            } else {
                $user->vehicleOwner()->create(['id_number' => $validated['id_number']]);
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->fresh()->load('vehicleOwner'),
        ]);
    }
}

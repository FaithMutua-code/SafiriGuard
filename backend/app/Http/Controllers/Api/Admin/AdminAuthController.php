<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * Admin login — only users with role='admin' may authenticate here.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Access denied. Admin credentials required.'], 403);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'This admin account has been deactivated.'], 403);
        }

        // Revoke previous admin tokens and issue a fresh one
        $user->tokens()->where('name', 'admin_token')->delete();
        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'admin' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout: revoke current admin token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Return the currently authenticated admin.
     */
    public function me(Request $request)
    {
        return response()->json(['admin' => $request->user()]);
    }
}

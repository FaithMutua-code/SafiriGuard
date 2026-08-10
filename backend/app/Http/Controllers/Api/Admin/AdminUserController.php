<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all non-admin users with their roles.
     */
    public function index(Request $request)
    {
        $query = User::where('role', '!=', 'admin');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($request->has('is_active')) {
            $active = filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $active);
        }

        $users = $query->latest()->paginate(20);

        return response()->json($users);
    }

    /**
     * Get single user detail.
     */
    public function show($id)
    {
        $user = User::with(['vehicleOwner.vehicles', 'sacco:id,name'])->findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json(['user' => $user]);
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot deactivate admin accounts.'], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'User activated.' : 'User deactivated.',
            'is_active' => $user->is_active,
        ]);
    }
}

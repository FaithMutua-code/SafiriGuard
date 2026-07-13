<?php
// app/Http/Controllers/Api/Auth/VerifyOtpController.php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VerifyOtpController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
        ]);

        $record = DB::table('password_reset_otps')
            ->where('email', $data['email'])
            ->where('otp', $data['otp'])
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid code.'], 422);
        }

        if (now()->greaterThan($record->expires_at)) {
            return response()->json(['message' => 'This code has expired. Please request a new one.'], 422);
        }

        return response()->json(['message' => 'Code is valid.']);
    }
}

<?php
// app/Http/Controllers/Api/Auth/ForgotPasswordController.php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetOtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'If that email exists, a code has been sent.']);
        }

        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_otps')->where('email', $data['email'])->delete();
        DB::table('password_reset_otps')->insert([
            'email' => $data['email'],
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::to($user->email)->send(new PasswordResetOtpMail($otp));

        return response()->json(['message' => 'If that email exists, a code has been sent.']);
    }
}

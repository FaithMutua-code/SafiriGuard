<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            // Don't reveal whether the email exists — same generic response either way
            return response()->json(['message' => 'If that email exists, a reset link has been sent.']);
        }

        return response()->json(['message' => 'Reset link sent.']);
    }
}

<?php

namespace App\Http\Controllers\Api\Owner;

use App\Http\Controllers\Controller;
use App\Models\PushToken;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'token'    => 'required|string',
            'platform' => 'required|in:ios,android,web',
        ]);

        $pushToken = PushToken::updateOrCreate(
            ['user_id' => $request->user()->id, 'token' => $data['token']],
            ['platform' => $data['platform']]
        );

        return response()->json(['push_token' => $pushToken], 201);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate(['token' => 'required|string']);

        PushToken::where('user_id', $request->user()->id)
            ->where('token', $data['token'])
            ->delete();

        return response()->noContent();
    }
}

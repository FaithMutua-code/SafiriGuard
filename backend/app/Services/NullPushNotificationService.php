<?php

namespace App\Services;

use App\Services\Contracts\PushNotificationInterface;
use Illuminate\Support\Facades\Log;

class NullPushNotificationService implements PushNotificationInterface
{
    public function send(int $userId, string $title, string $body, array $data = []): void
    {
        Log::info('Push notification stub', [
            'user_id' => $userId,
            'title'   => $title,
            'body'    => $body,
            'data'    => $data,
        ]);
    }
}

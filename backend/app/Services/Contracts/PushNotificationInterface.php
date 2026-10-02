<?php

namespace App\Services\Contracts;

interface PushNotificationInterface
{
    public function send(int $userId, string $title, string $body, array $data = []): void;
}

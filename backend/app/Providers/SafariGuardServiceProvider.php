<?php

namespace App\Providers;

use App\Services\Contracts\PushNotificationInterface;
use App\Services\NullPushNotificationService;
use Illuminate\Support\ServiceProvider;

class SafariGuardServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PushNotificationInterface::class, NullPushNotificationService::class);
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Console\Commands\SimulateDeviceCommand::class,
            ]);
        }
    }
}

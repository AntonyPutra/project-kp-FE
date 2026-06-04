<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Models\Asset;
use App\Models\Letter;
use App\Models\SocialAidApplication;
use App\Observers\AuditableObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Asset::observe(AuditableObserver::class);
        Letter::observe(AuditableObserver::class);
        SocialAidApplication::observe(AuditableObserver::class);
    }
}

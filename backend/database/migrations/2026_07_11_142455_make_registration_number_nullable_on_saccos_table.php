<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_make_registration_number_nullable_on_saccos_table.php
    public function up(): void
    {
        Schema::table('saccos', function (Blueprint $table) {
            $table->string('registration_number')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('saccos', function (Blueprint $table) {
            $table->string('registration_number')->nullable(false)->change();
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_aid_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('social_aid_id')->constrained('social_aids')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'distributed'])->default('pending');
            $table->timestamps();
            
            $table->unique(['social_aid_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_aid_applications');
    }
};

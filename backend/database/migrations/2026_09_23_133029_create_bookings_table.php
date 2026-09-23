<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('type')->default('session'); // session|class
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('status')->default('confirmed'); // confirmed|pending|cancelled|completed
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->uuid('series_id')->nullable();
            $table->timestamps();

            $table->index('series_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

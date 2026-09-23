<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('confirmed'); // confirmed|pending|cancelled
            $table->timestamps();

            $table->unique(['booking_id', 'client_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_attendees');
    }
};

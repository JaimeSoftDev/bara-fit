<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('workout_plans')->cascadeOnDelete();
            $table->foreignId('day_id')->constrained('workout_days')->cascadeOnDelete();
            $table->date('date');
            $table->json('completed_item_ids')->nullable();
            $table->timestamps();

            $table->unique(['client_id', 'day_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_completions');
    }
};

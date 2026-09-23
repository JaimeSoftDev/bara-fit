<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutItem extends Model
{
    protected $fillable = [
        'workout_day_id', 'exercise_id', 'sets', 'reps', 'load_kg', 'rest_seconds', 'notes', 'position',
    ];

    protected function casts(): array
    {
        return [
            'load_kg' => 'float',
        ];
    }

    public function day(): BelongsTo
    {
        return $this->belongsTo(WorkoutDay::class, 'workout_day_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}

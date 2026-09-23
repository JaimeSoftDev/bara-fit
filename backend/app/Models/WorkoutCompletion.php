<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutCompletion extends Model
{
    protected $fillable = ['client_id', 'plan_id', 'day_id', 'date', 'completed_item_ids'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'completed_item_ids' => 'array',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(WorkoutPlan::class, 'plan_id');
    }

    public function day(): BelongsTo
    {
        return $this->belongsTo(WorkoutDay::class, 'day_id');
    }
}

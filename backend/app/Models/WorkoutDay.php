<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutDay extends Model
{
    protected $fillable = ['workout_plan_id', 'label', 'position'];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(WorkoutPlan::class, 'workout_plan_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(WorkoutItem::class)->orderBy('position');
    }
}

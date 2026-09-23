<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NutritionPlan extends Model
{
    protected $fillable = [
        'trainer_id', 'client_id', 'name', 'daily_calories', 'protein_g', 'carbs_g', 'fat_g', 'notes',
    ];

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function meals(): HasMany
    {
        return $this->hasMany(Meal::class)->orderBy('position');
    }
}

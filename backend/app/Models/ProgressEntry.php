<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressEntry extends Model
{
    protected $fillable = [
        'client_id', 'date', 'weight_kg', 'body_fat_pct', 'measurements', 'photo_url', 'note',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'weight_kg' => 'float',
            'body_fat_pct' => 'float',
            'measurements' => 'array',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}

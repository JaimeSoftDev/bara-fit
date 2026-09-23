<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'trainer_id', 'client_id', 'concept', 'amount', 'status', 'issued_at', 'due_date', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'issued_at' => 'date',
            'due_date' => 'date',
            'paid_at' => 'date',
        ];
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}

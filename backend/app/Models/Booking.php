<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Booking extends Model
{
    protected $fillable = [
        'trainer_id', 'title', 'type', 'starts_at', 'ends_at', 'status', 'location', 'notes', 'capacity', 'series_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function attendees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'booking_attendees', 'booking_id', 'client_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function activeAttendees(): BelongsToMany
    {
        return $this->attendees()->wherePivot('status', '!=', 'cancelled');
    }
}

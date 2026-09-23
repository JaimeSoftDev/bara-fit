<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    protected $fillable = ['owner_id', 'name', 'brand_color', 'logo_url'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function trainerProfiles(): HasMany
    {
        return $this->hasMany(TrainerProfile::class);
    }

    public function invites(): HasMany
    {
        return $this->hasMany(BusinessInvite::class);
    }

    public function payrollEntries(): HasMany
    {
        return $this->hasMany(PayrollEntry::class);
    }

    /** @return array<int, int> */
    public function trainerUserIds(): array
    {
        return $this->trainerProfiles()->pluck('user_id')->all();
    }
}

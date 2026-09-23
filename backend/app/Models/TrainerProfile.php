<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerProfile extends Model
{
    protected $fillable = ['user_id', 'business_id', 'business_role', 'specialties', 'bio', 'brand_color', 'logo_url'];

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function isBusinessOwner(): bool
    {
        return $this->business_role === 'owner';
    }

    /** Effective brand color for this trainer: their business's, falling back to their own. */
    public function effectiveBrandColor(): ?string
    {
        return $this->business?->brand_color ?? $this->brand_color;
    }

    public function effectiveLogoUrl(): ?string
    {
        return $this->business?->logo_url ?? $this->logo_url;
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'brandColor' => $this->brand_color,
            'logoUrl' => $this->logo_url,
            'ownerId' => (string) $this->owner_id,
            'members' => $this->whenLoaded('trainerProfiles', fn () => $this->trainerProfiles
                ->map(fn ($profile) => [
                    'id' => (string) $profile->user_id,
                    'name' => $profile->user->name,
                    'email' => $profile->user->email,
                    'role' => $profile->business_role,
                ])
                ->values()),
        ];
    }
}

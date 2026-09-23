<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Base user resource. Merges role-specific profile fields onto the user
 * object, matching the frontend's flattened TrainerProfile/ClientProfile
 * TypeScript shapes.
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'avatarUrl' => $this->avatar_url,
            'phone' => $this->phone,
        ];

        if ($this->role === 'trainer' && $this->relationLoaded('trainerProfile') && $this->trainerProfile) {
            $profile = $this->trainerProfile;
            $data['specialties'] = $profile->specialties ?? [];
            $data['bio'] = $profile->bio;
            $data['brandColor'] = $profile->effectiveBrandColor();
            $data['logoUrl'] = $profile->effectiveLogoUrl();
            $data['businessId'] = $profile->business_id ? (string) $profile->business_id : null;
            $data['businessName'] = $profile->relationLoaded('business') ? $profile->business?->name : null;
            $data['businessRole'] = $profile->business_role;
        }

        if ($this->role === 'client' && $this->relationLoaded('clientProfile') && $this->clientProfile) {
            $data['trainerId'] = (string) $this->clientProfile->trainer_id;
            $data['goal'] = $this->clientProfile->goal;
            $data['heightCm'] = $this->clientProfile->height_cm;
            $data['startWeightKg'] = $this->clientProfile->start_weight_kg;
            $data['birthDate'] = optional($this->clientProfile->birth_date)->toDateString();

            $trainerProfile = $this->clientProfile->relationLoaded('trainer')
                ? $this->clientProfile->trainer?->trainerProfile
                : null;
            $data['brandColor'] = $trainerProfile?->effectiveBrandColor();
            $data['logoUrl'] = $trainerProfile?->effectiveLogoUrl();
        }

        return $data;
    }
}

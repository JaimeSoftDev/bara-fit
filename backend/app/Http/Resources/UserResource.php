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
            $data['specialties'] = $this->trainerProfile->specialties ?? [];
            $data['bio'] = $this->trainerProfile->bio;
            $data['brandColor'] = $this->trainerProfile->brand_color;
        }

        if ($this->role === 'client' && $this->relationLoaded('clientProfile') && $this->clientProfile) {
            $data['trainerId'] = (string) $this->clientProfile->trainer_id;
            $data['goal'] = $this->clientProfile->goal;
            $data['heightCm'] = $this->clientProfile->height_cm;
            $data['startWeightKg'] = $this->clientProfile->start_weight_kg;
            $data['birthDate'] = optional($this->clientProfile->birth_date)->toDateString();
        }

        return $data;
    }
}

<?php

namespace App\Http\Resources;

use App\Models\ClientProfile;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminBusinessResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $members = $this->trainerProfiles->map(function ($profile) {
            $clientCount = ClientProfile::where('trainer_id', $profile->user_id)->count();
            $revenue = (float) Invoice::where('trainer_id', $profile->user_id)->where('status', 'paid')->sum('amount');

            return [
                'id' => (string) $profile->user_id,
                'name' => $profile->user->name,
                'email' => $profile->user->email,
                'role' => $profile->business_role,
                'clientCount' => $clientCount,
                'revenue' => $revenue,
            ];
        })->values();

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'brandColor' => $this->brand_color,
            'logoUrl' => $this->logo_url,
            'ownerName' => $this->owner?->name,
            'ownerEmail' => $this->owner?->email,
            'memberCount' => $members->count(),
            'clientCount' => $members->sum('clientCount'),
            'revenue' => $members->sum('revenue'),
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'members' => $members,
        ];
    }
}

<?php

namespace App\Http\Resources;

use App\Models\ClientProfile;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** An independent trainer (no business_id) as seen from the admin panel. */
class AdminTrainerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $clientCount = ClientProfile::where('trainer_id', $this->user_id)->count();
        $revenue = (float) Invoice::where('trainer_id', $this->user_id)->where('status', 'paid')->sum('amount');

        return [
            'id' => (string) $this->user_id,
            'name' => $this->user->name,
            'email' => $this->user->email,
            'bio' => $this->bio,
            'specialties' => $this->specialties ?? [],
            'clientCount' => $clientCount,
            'revenue' => $revenue,
            'createdAt' => optional($this->user->created_at)->toIso8601String(),
        ];
    }
}

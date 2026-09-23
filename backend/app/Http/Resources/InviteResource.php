<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InviteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'trainerId' => (string) $this->trainer_id,
            'name' => $this->name,
            'email' => $this->email,
            'goal' => $this->goal,
            'heightCm' => $this->height_cm,
            'status' => $this->status,
            'expiresAt' => optional($this->expires_at)->toIso8601String(),
            'acceptUrl' => rtrim(config('app.frontend_url'), '/')."/invite/{$this->token}",
        ];
    }
}

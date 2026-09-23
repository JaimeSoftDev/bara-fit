<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessInviteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'businessId' => (string) $this->business_id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'expiresAt' => optional($this->expires_at)->toIso8601String(),
            'acceptUrl' => rtrim(config('app.frontend_url'), '/')."/team-invite/{$this->token}",
        ];
    }
}

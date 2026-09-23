<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgressEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'clientId' => (string) $this->client_id,
            'date' => optional($this->date)->toDateString(),
            'weightKg' => $this->weight_kg,
            'bodyFatPct' => $this->body_fat_pct,
            'measurements' => $this->measurements,
            'photoUrl' => $this->photo_url,
            'note' => $this->note,
        ];
    }
}

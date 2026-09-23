<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'businessId' => (string) $this->business_id,
            'trainerId' => (string) $this->trainer_id,
            'trainerName' => $this->whenLoaded('trainer', fn () => $this->trainer->name),
            'periodLabel' => $this->period_label,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'paidAt' => optional($this->paid_at)->toIso8601String(),
        ];
    }
}

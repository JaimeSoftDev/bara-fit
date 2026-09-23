<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'trainerId' => (string) $this->trainer_id,
            'clientId' => (string) $this->client_id,
            'concept' => $this->concept,
            'amount' => $this->amount,
            'status' => $this->status,
            'issuedAt' => optional($this->issued_at)->toDateString(),
            'dueDate' => optional($this->due_date)->toDateString(),
            'paidAt' => optional($this->paid_at)->toDateString(),
        ];
    }
}

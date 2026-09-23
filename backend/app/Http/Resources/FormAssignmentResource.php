<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'formId' => (string) $this->form_id,
            'clientId' => (string) $this->client_id,
            'status' => $this->status,
            'assignedAt' => optional($this->assigned_at)->toIso8601String(),
            'completedAt' => optional($this->completed_at)->toIso8601String(),
            'form' => $this->whenLoaded('form', fn () => (new FormResource($this->form))->resolve()),
            'client' => $this->whenLoaded('client', fn () => (new UserResource($this->client))->resolve()),
        ];
    }
}

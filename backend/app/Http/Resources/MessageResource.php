<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'conversationId' => (string) $this->conversation_id,
            'senderId' => (string) $this->sender_id,
            'text' => $this->text,
            'createdAt' => optional($this->created_at)->toIso8601String(),
        ];
    }
}

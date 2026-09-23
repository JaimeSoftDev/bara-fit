<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attendees = $this->whenLoaded('attendees');

        return [
            'id' => (string) $this->id,
            'trainerId' => (string) $this->trainer_id,
            'title' => $this->title,
            'type' => $this->type,
            'startsAt' => optional($this->starts_at)->toIso8601String(),
            'endsAt' => optional($this->ends_at)->toIso8601String(),
            'status' => $this->status,
            'location' => $this->location,
            'notes' => $this->notes,
            'capacity' => $this->capacity,
            'seriesId' => $this->series_id,
            'attendeeCount' => $attendees instanceof \Illuminate\Support\Collection
                ? $attendees->where('pivot.status', '!=', 'cancelled')->count()
                : null,
            'attendees' => $this->whenLoaded('attendees', fn () => $this->attendees
                ->where('pivot.status', '!=', 'cancelled')
                ->values()
                ->map(fn ($client) => (new UserResource($client))->resolve())),
        ];
    }
}

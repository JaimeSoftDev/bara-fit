<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'trainerId' => (string) $this->trainer_id,
            'clientId' => (string) $this->client_id,
            'name' => $this->name,
            'startDate' => optional($this->start_date)->toDateString(),
            'endDate' => optional($this->end_date)->toDateString(),
            'status' => $this->status,
            'days' => $this->whenLoaded('days', fn () => $this->days->map(fn ($day) => [
                'id' => (string) $day->id,
                'label' => $day->label,
                'items' => $day->items->map(fn ($item) => [
                    'id' => (string) $item->id,
                    'exerciseId' => (string) $item->exercise_id,
                    'sets' => $item->sets,
                    'reps' => $item->reps,
                    'loadKg' => $item->load_kg,
                    'restSeconds' => $item->rest_seconds,
                    'notes' => $item->notes,
                ]),
            ])),
        ];
    }
}

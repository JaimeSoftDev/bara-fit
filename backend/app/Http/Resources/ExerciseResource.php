<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'trainerId' => (string) $this->trainer_id,
            'name' => $this->name,
            'muscleGroup' => $this->muscle_group,
            'equipment' => $this->equipment,
            'videoUrl' => $this->video_url,
            'notes' => $this->notes,
        ];
    }
}

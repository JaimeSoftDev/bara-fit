<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NutritionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'trainerId' => (string) $this->trainer_id,
            'clientId' => (string) $this->client_id,
            'name' => $this->name,
            'dailyCalories' => $this->daily_calories,
            'proteinG' => $this->protein_g,
            'carbsG' => $this->carbs_g,
            'fatG' => $this->fat_g,
            'notes' => $this->notes,
            'meals' => $this->whenLoaded('meals', fn () => $this->meals->map(fn ($meal) => [
                'id' => (string) $meal->id,
                'name' => $meal->name,
                'description' => $meal->description,
                'calories' => $meal->calories,
                'protein' => $meal->protein,
                'carbs' => $meal->carbs,
                'fat' => $meal->fat,
            ])),
        ];
    }
}

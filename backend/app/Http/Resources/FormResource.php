<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'trainerId' => (string) $this->trainer_id,
            'title' => $this->title,
            'description' => $this->description,
            'fields' => $this->whenLoaded('fields', fn () => $this->fields->map(fn ($field) => [
                'id' => (string) $field->id,
                'label' => $field->label,
                'type' => $field->type,
                'required' => $field->required,
                'options' => $field->options ?? [],
                'position' => $field->position,
            ])),
        ];
    }
}

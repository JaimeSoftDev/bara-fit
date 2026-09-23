<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The submitted answers for a FormAssignment, joined with the field labels
 * so the trainer (or client) can render them without a second lookup.
 */
class FormSubmissionResource extends JsonResource
{
    /**
     * The `answers` map is keyed by field id, which is numeric — without this,
     * JsonResource's filter() silently reindexes numeric-keyed arrays into a
     * plain list and the field-id -> answer association is lost.
     */
    protected $preserveKeys = true;

    public function toArray(Request $request): array
    {
        $assignment = $this->formAssignment;
        $fieldsById = $assignment?->form?->fields->keyBy('id');

        $answers = collect($this->answers ?? [])->map(function ($value, $fieldId) use ($fieldsById) {
            $field = $fieldsById?->get((int) $fieldId);

            return [
                'fieldId' => (string) $fieldId,
                'label' => $field?->label,
                'type' => $field?->type,
                'value' => $value,
            ];
        })->values();

        return [
            'id' => (string) $this->id,
            'formAssignmentId' => (string) $this->form_assignment_id,
            'answers' => $this->answers ?? [],
            'answerDetails' => $answers,
            'submittedAt' => optional($this->submitted_at)->toIso8601String(),
        ];
    }
}

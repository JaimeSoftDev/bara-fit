<?php

namespace App\Http\Controllers;

use App\Http\Resources\FormAssignmentResource;
use App\Http\Resources\FormResource;
use App\Models\Form;
use App\Models\FormAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FormController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Form::class);

        $user = $request->user();

        $forms = Form::with('fields')
            ->where('trainer_id', $user->id)
            ->orderByDesc('id')
            ->get();

        return FormResource::collection($forms);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Form::class);

        $data = $this->validateForm($request);

        $form = DB::transaction(function () use ($data, $request) {
            $form = Form::create([
                'trainer_id' => $request->user()->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
            ]);

            $this->syncFields($form, $data['fields'] ?? []);

            return $form;
        });

        return new FormResource($form->load('fields'));
    }

    public function show(Request $request, Form $form)
    {
        $this->authorize('view', $form);

        return new FormResource($form->load('fields'));
    }

    public function update(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $data = $this->validateForm($request, partial: true);

        DB::transaction(function () use ($form, $data) {
            $form->update([
                'title' => $data['title'] ?? $form->title,
                'description' => array_key_exists('description', $data) ? $data['description'] : $form->description,
            ]);

            if (array_key_exists('fields', $data)) {
                // Replace the whole fields list.
                $form->fields()->delete();
                $this->syncFields($form, $data['fields'] ?? []);
            }
        });

        return new FormResource($form->fresh()->load('fields'));
    }

    public function destroy(Request $request, Form $form)
    {
        $this->authorize('delete', $form);

        $form->delete();

        return response()->json(null, 204);
    }

    public function assign(Request $request, Form $form)
    {
        $this->authorize('update', $form);

        $data = $request->validate([
            'clientIds' => ['required', 'array', 'min:1'],
            'clientIds.*' => ['integer', 'exists:users,id'],
        ]);

        $assignments = DB::transaction(function () use ($form, $data) {
            $created = collect();

            foreach ($data['clientIds'] as $clientId) {
                $alreadyPending = FormAssignment::where('form_id', $form->id)
                    ->where('client_id', $clientId)
                    ->where('status', 'pending')
                    ->exists();

                if ($alreadyPending) {
                    continue;
                }

                $created->push(FormAssignment::create([
                    'form_id' => $form->id,
                    'client_id' => $clientId,
                    'status' => 'pending',
                    'assigned_at' => now(),
                ]));
            }

            return $created;
        });

        $assignments->each->load('form.fields', 'client');

        return FormAssignmentResource::collection($assignments);
    }

    private function validateForm(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$req, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'fields' => ['sometimes', 'array'],
            'fields.*.label' => ['required_with:fields', 'string', 'max:255'],
            'fields.*.type' => ['required_with:fields', 'in:text,textarea,number,date,yesno,select,checkbox'],
            'fields.*.required' => ['nullable', 'boolean'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.options.*' => ['string', 'max:255'],
        ]);
    }

    private function syncFields(Form $form, array $fields): void
    {
        foreach ($fields as $index => $fieldData) {
            $form->fields()->create([
                'label' => $fieldData['label'],
                'type' => $fieldData['type'],
                'required' => $fieldData['required'] ?? false,
                'options' => in_array($fieldData['type'], ['select', 'checkbox'], true)
                    ? ($fieldData['options'] ?? [])
                    : null,
                'position' => $index,
            ]);
        }
    }
}

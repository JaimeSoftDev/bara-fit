<?php

namespace App\Http\Controllers;

use App\Http\Resources\FormAssignmentResource;
use App\Http\Resources\FormSubmissionResource;
use App\Models\FormAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FormAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', FormAssignment::class);

        $user = $request->user();
        $query = FormAssignment::with('form.fields', 'client')->orderByDesc('id');

        if ($user->isTrainer()) {
            $query->whereHas('form', fn ($q) => $q->where('trainer_id', $user->id));

            if ($request->filled('clientId')) {
                $query->where('client_id', $request->query('clientId'));
            }
        } else {
            $query->where('client_id', $user->id);
        }

        return FormAssignmentResource::collection($query->get());
    }

    public function submit(Request $request, FormAssignment $formAssignment)
    {
        $this->authorize('submit', $formAssignment);

        abort_if($formAssignment->status === 'completed', 422, 'Este formulario ya ha sido completado.');

        $data = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        $submission = DB::transaction(function () use ($formAssignment, $data) {
            $submission = $formAssignment->submission()->create([
                'answers' => $data['answers'],
                'submitted_at' => now(),
            ]);

            $formAssignment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            return $submission;
        });

        return new FormSubmissionResource($submission->load('formAssignment.form.fields'));
    }

    public function submission(Request $request, FormAssignment $formAssignment)
    {
        $this->authorize('view', $formAssignment);

        $submission = $formAssignment->submission()->with('formAssignment.form.fields')->first();

        abort_if(! $submission, 404, 'Este formulario todavía no ha sido completado.');

        return new FormSubmissionResource($submission);
    }
}

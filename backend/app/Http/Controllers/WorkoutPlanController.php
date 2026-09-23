<?php

namespace App\Http\Controllers;

use App\Http\Resources\WorkoutPlanResource;
use App\Models\WorkoutCompletion;
use App\Models\WorkoutPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkoutPlanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', WorkoutPlan::class);

        $user = $request->user();
        $query = WorkoutPlan::with('days.items')->orderByDesc('start_date');

        if ($user->isTrainer()) {
            $query->where('trainer_id', $user->id);
        } else {
            $query->where('client_id', $user->id);
        }

        if ($request->filled('clientId')) {
            $query->where('client_id', $request->query('clientId'));
        }

        return WorkoutPlanResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $this->authorize('create', WorkoutPlan::class);

        $data = $this->validatePlan($request);

        $plan = DB::transaction(function () use ($data, $request) {
            $plan = WorkoutPlan::create([
                'trainer_id' => $request->user()->id,
                'client_id' => $data['clientId'],
                'name' => $data['name'],
                'start_date' => $data['startDate'],
                'end_date' => $data['endDate'] ?? null,
                'status' => $data['status'] ?? 'draft',
            ]);

            $this->syncDays($plan, $data['days'] ?? []);

            return $plan;
        });

        return new WorkoutPlanResource($plan->load('days.items'));
    }

    public function show(Request $request, WorkoutPlan $workoutPlan)
    {
        $this->authorize('view', $workoutPlan);

        return new WorkoutPlanResource($workoutPlan->load('days.items'));
    }

    public function update(Request $request, WorkoutPlan $workoutPlan)
    {
        $this->authorize('update', $workoutPlan);

        $data = $this->validatePlan($request, partial: true);

        DB::transaction(function () use ($workoutPlan, $data) {
            $workoutPlan->update([
                'name' => $data['name'] ?? $workoutPlan->name,
                'start_date' => $data['startDate'] ?? $workoutPlan->start_date,
                'end_date' => array_key_exists('endDate', $data) ? $data['endDate'] : $workoutPlan->end_date,
                'status' => $data['status'] ?? $workoutPlan->status,
            ]);

            if (array_key_exists('days', $data)) {
                // Replace the whole nested days/items tree.
                $workoutPlan->days()->delete();
                $this->syncDays($workoutPlan, $data['days'] ?? []);
            }
        });

        return new WorkoutPlanResource($workoutPlan->fresh()->load('days.items'));
    }

    public function storeCompletion(Request $request, WorkoutPlan $workoutPlan)
    {
        $this->authorize('recordCompletion', $workoutPlan);

        $data = $request->validate([
            'dayId' => ['required', 'integer'],
            'date' => ['required', 'date'],
            'completedItemIds' => ['array'],
            'completedItemIds.*' => ['string'],
        ]);

        $completion = WorkoutCompletion::updateOrCreate(
            [
                'client_id' => $request->user()->id,
                'plan_id' => $workoutPlan->id,
                'day_id' => $data['dayId'],
                'date' => $data['date'],
            ],
            [
                'completed_item_ids' => $data['completedItemIds'] ?? [],
            ]
        );

        return response()->json([
            'id' => (string) $completion->id,
            'clientId' => (string) $completion->client_id,
            'planId' => (string) $completion->plan_id,
            'dayId' => (string) $completion->day_id,
            'date' => $completion->date->toDateString(),
            'completedItemIds' => $completion->completed_item_ids ?? [],
        ], 201);
    }

    private function validatePlan(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        $validated = $request->validate([
            'clientId' => [$partial ? 'sometimes' : 'required', 'integer', 'exists:users,id'],
            'name' => [$req, 'string', 'max:255'],
            'startDate' => [$req, 'date'],
            'endDate' => ['nullable', 'date'],
            'status' => ['nullable', 'in:active,draft,completed'],
            'days' => ['sometimes', 'array'],
            'days.*.label' => ['required_with:days', 'string'],
            'days.*.items' => ['sometimes', 'array'],
            'days.*.items.*.exerciseId' => ['required_with:days.*.items', 'integer', 'exists:exercises,id'],
            'days.*.items.*.sets' => ['required_with:days.*.items', 'integer', 'min:1'],
            'days.*.items.*.reps' => ['required_with:days.*.items', 'string'],
            'days.*.items.*.loadKg' => ['nullable', 'numeric'],
            'days.*.items.*.restSeconds' => ['nullable', 'integer', 'min:0'],
            'days.*.items.*.notes' => ['nullable', 'string'],
        ]);

        return $validated;
    }

    private function syncDays(WorkoutPlan $plan, array $days): void
    {
        foreach ($days as $dayIndex => $dayData) {
            $day = $plan->days()->create([
                'label' => $dayData['label'],
                'position' => $dayIndex,
            ]);

            foreach (($dayData['items'] ?? []) as $itemIndex => $itemData) {
                $day->items()->create([
                    'exercise_id' => $itemData['exerciseId'],
                    'sets' => $itemData['sets'],
                    'reps' => $itemData['reps'],
                    'load_kg' => $itemData['loadKg'] ?? null,
                    'rest_seconds' => $itemData['restSeconds'] ?? 60,
                    'notes' => $itemData['notes'] ?? null,
                    'position' => $itemIndex,
                ]);
            }
        }
    }
}

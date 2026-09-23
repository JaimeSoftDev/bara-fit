<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExerciseResource;
use App\Models\Exercise;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Exercise::class);

        $user = $request->user();
        $trainerId = $user->isTrainer() ? $user->id : $user->clientProfile?->trainer_id;

        $exercises = Exercise::where('trainer_id', $trainerId)->orderBy('name')->get();

        return ExerciseResource::collection($exercises);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Exercise::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'muscleGroup' => ['required', 'string'],
            'equipment' => ['nullable', 'string'],
            'videoUrl' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
        ]);

        $exercise = Exercise::create([
            'trainer_id' => $request->user()->id,
            'name' => $data['name'],
            'muscle_group' => $data['muscleGroup'],
            'equipment' => $data['equipment'] ?? null,
            'video_url' => $data['videoUrl'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return new ExerciseResource($exercise);
    }

    public function show(Request $request, Exercise $exercise)
    {
        $this->authorize('view', $exercise);

        return new ExerciseResource($exercise);
    }

    public function update(Request $request, Exercise $exercise)
    {
        $this->authorize('update', $exercise);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'muscleGroup' => ['sometimes', 'string'],
            'equipment' => ['nullable', 'string'],
            'videoUrl' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
        ]);

        $exercise->update([
            'name' => $data['name'] ?? $exercise->name,
            'muscle_group' => $data['muscleGroup'] ?? $exercise->muscle_group,
            'equipment' => array_key_exists('equipment', $data) ? $data['equipment'] : $exercise->equipment,
            'video_url' => array_key_exists('videoUrl', $data) ? $data['videoUrl'] : $exercise->video_url,
            'notes' => array_key_exists('notes', $data) ? $data['notes'] : $exercise->notes,
        ]);

        return new ExerciseResource($exercise);
    }

    public function destroy(Request $request, Exercise $exercise)
    {
        $this->authorize('delete', $exercise);

        $exercise->delete();

        return response()->json(null, 204);
    }
}

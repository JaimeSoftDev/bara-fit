<?php

namespace App\Http\Controllers;

use App\Http\Resources\NutritionPlanResource;
use App\Models\NutritionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NutritionPlanController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', NutritionPlan::class);

        $user = $request->user();
        $query = NutritionPlan::with('meals')->orderByDesc('id');

        if ($user->isTrainer()) {
            $query->where('trainer_id', $user->id);
        } else {
            $query->where('client_id', $user->id);
        }

        if ($request->filled('clientId')) {
            $query->where('client_id', $request->query('clientId'));
        }

        return NutritionPlanResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $this->authorize('create', NutritionPlan::class);

        $data = $this->validatePlan($request);

        $plan = DB::transaction(function () use ($data, $request) {
            $plan = NutritionPlan::create([
                'trainer_id' => $request->user()->id,
                'client_id' => $data['clientId'],
                'name' => $data['name'],
                'daily_calories' => $data['dailyCalories'],
                'protein_g' => $data['proteinG'],
                'carbs_g' => $data['carbsG'],
                'fat_g' => $data['fatG'],
                'notes' => $data['notes'] ?? null,
            ]);

            $this->syncMeals($plan, $data['meals'] ?? []);

            return $plan;
        });

        return new NutritionPlanResource($plan->load('meals'));
    }

    public function show(Request $request, NutritionPlan $nutritionPlan)
    {
        $this->authorize('view', $nutritionPlan);

        return new NutritionPlanResource($nutritionPlan->load('meals'));
    }

    public function update(Request $request, NutritionPlan $nutritionPlan)
    {
        $this->authorize('update', $nutritionPlan);

        $data = $this->validatePlan($request, partial: true);

        DB::transaction(function () use ($nutritionPlan, $data) {
            $nutritionPlan->update([
                'name' => $data['name'] ?? $nutritionPlan->name,
                'daily_calories' => $data['dailyCalories'] ?? $nutritionPlan->daily_calories,
                'protein_g' => $data['proteinG'] ?? $nutritionPlan->protein_g,
                'carbs_g' => $data['carbsG'] ?? $nutritionPlan->carbs_g,
                'fat_g' => $data['fatG'] ?? $nutritionPlan->fat_g,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $nutritionPlan->notes,
            ]);

            if (array_key_exists('meals', $data)) {
                $nutritionPlan->meals()->delete();
                $this->syncMeals($nutritionPlan, $data['meals'] ?? []);
            }
        });

        return new NutritionPlanResource($nutritionPlan->fresh()->load('meals'));
    }

    private function validatePlan(Request $request, bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'clientId' => [$partial ? 'sometimes' : 'required', 'integer', 'exists:users,id'],
            'name' => [$req, 'string', 'max:255'],
            'dailyCalories' => [$req, 'integer', 'min:0'],
            'proteinG' => [$req, 'integer', 'min:0'],
            'carbsG' => [$req, 'integer', 'min:0'],
            'fatG' => [$req, 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'meals' => ['sometimes', 'array'],
            'meals.*.name' => ['required_with:meals', 'string'],
            'meals.*.description' => ['nullable', 'string'],
            'meals.*.calories' => ['required_with:meals', 'integer', 'min:0'],
            'meals.*.protein' => ['required_with:meals', 'integer', 'min:0'],
            'meals.*.carbs' => ['required_with:meals', 'integer', 'min:0'],
            'meals.*.fat' => ['required_with:meals', 'integer', 'min:0'],
        ]);
    }

    private function syncMeals(NutritionPlan $plan, array $meals): void
    {
        foreach ($meals as $index => $meal) {
            $plan->meals()->create([
                'name' => $meal['name'],
                'description' => $meal['description'] ?? null,
                'calories' => $meal['calories'],
                'protein' => $meal['protein'],
                'carbs' => $meal['carbs'],
                'fat' => $meal['fat'],
                'position' => $index,
            ]);
        }
    }
}

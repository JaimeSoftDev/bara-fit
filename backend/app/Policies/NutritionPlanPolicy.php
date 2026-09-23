<?php

namespace App\Policies;

use App\Models\NutritionPlan;
use App\Models\User;

class NutritionPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, NutritionPlan $nutritionPlan): bool
    {
        return $user->id === $nutritionPlan->trainer_id || $user->id === $nutritionPlan->client_id;
    }

    public function create(User $user): bool
    {
        return $user->isTrainer();
    }

    public function update(User $user, NutritionPlan $nutritionPlan): bool
    {
        return $user->id === $nutritionPlan->trainer_id;
    }

    public function delete(User $user, NutritionPlan $nutritionPlan): bool
    {
        return $this->update($user, $nutritionPlan);
    }
}

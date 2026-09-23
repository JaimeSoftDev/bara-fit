<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkoutPlan;

class WorkoutPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, WorkoutPlan $workoutPlan): bool
    {
        return $user->id === $workoutPlan->trainer_id || $user->id === $workoutPlan->client_id;
    }

    public function create(User $user): bool
    {
        return $user->isTrainer();
    }

    public function update(User $user, WorkoutPlan $workoutPlan): bool
    {
        return $user->id === $workoutPlan->trainer_id;
    }

    public function delete(User $user, WorkoutPlan $workoutPlan): bool
    {
        return $this->update($user, $workoutPlan);
    }

    public function recordCompletion(User $user, WorkoutPlan $workoutPlan): bool
    {
        return $user->isClient() && $user->id === $workoutPlan->client_id;
    }
}

<?php

namespace App\Policies;

use App\Models\Exercise;
use App\Models\User;

class ExercisePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Exercise $exercise): bool
    {
        return $user->isTrainer()
            ? $user->id === $exercise->trainer_id
            : $user->clientProfile && $user->clientProfile->trainer_id === $exercise->trainer_id;
    }

    public function create(User $user): bool
    {
        return $user->isTrainer();
    }

    public function update(User $user, Exercise $exercise): bool
    {
        return $user->isTrainer() && $user->id === $exercise->trainer_id;
    }

    public function delete(User $user, Exercise $exercise): bool
    {
        return $this->update($user, $exercise);
    }
}

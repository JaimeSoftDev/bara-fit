<?php

namespace App\Policies;

use App\Models\Form;
use App\Models\User;

class FormPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Form $form): bool
    {
        return $user->isTrainer() && $user->id === $form->trainer_id;
    }

    public function create(User $user): bool
    {
        return $user->isTrainer();
    }

    public function update(User $user, Form $form): bool
    {
        return $user->isTrainer() && $user->id === $form->trainer_id;
    }

    public function delete(User $user, Form $form): bool
    {
        return $this->update($user, $form);
    }
}

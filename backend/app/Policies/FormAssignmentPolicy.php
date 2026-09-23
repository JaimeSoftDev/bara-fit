<?php

namespace App\Policies;

use App\Models\FormAssignment;
use App\Models\User;

class FormAssignmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, FormAssignment $formAssignment): bool
    {
        if ($user->isClient()) {
            return $user->id === $formAssignment->client_id;
        }

        return $user->id === $formAssignment->form->trainer_id;
    }

    public function submit(User $user, FormAssignment $formAssignment): bool
    {
        return $user->isClient() && $user->id === $formAssignment->client_id;
    }
}

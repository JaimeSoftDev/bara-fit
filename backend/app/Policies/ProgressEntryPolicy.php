<?php

namespace App\Policies;

use App\Models\ProgressEntry;
use App\Models\User;

class ProgressEntryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ProgressEntry $progressEntry): bool
    {
        if ($user->id === $progressEntry->client_id) {
            return true;
        }

        return $user->isTrainer()
            && $progressEntry->client->clientProfile
            && $progressEntry->client->clientProfile->trainer_id === $user->id;
    }

    /** Creating an entry for the given target client id. */
    public function createFor(User $user, int $targetClientId): bool
    {
        if ($user->isClient()) {
            return $user->id === $targetClientId;
        }

        if ($user->isTrainer()) {
            return $user->clients()->where('user_id', $targetClientId)->exists();
        }

        return false;
    }
}

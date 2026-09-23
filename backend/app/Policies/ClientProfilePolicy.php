<?php

namespace App\Policies;

use App\Models\ClientProfile;
use App\Models\User;

class ClientProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ClientProfile $clientProfile): bool
    {
        return $user->id === $clientProfile->trainer_id || $user->id === $clientProfile->user_id;
    }
}

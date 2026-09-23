<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Conversation $conversation): bool
    {
        return $user->id === $conversation->trainer_id || $user->id === $conversation->client_id;
    }

    public function participate(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }
}

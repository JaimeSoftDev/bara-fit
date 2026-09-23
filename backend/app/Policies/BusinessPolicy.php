<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\User;

class BusinessPolicy
{
    /** Any member of the business (owner or staff) can view it. */
    public function view(User $user, Business $business): bool
    {
        return $user->trainerProfile && $user->trainerProfile->business_id === $business->id;
    }

    /** Only the owner can invite staff, edit branding, or manage payroll. */
    public function manage(User $user, Business $business): bool
    {
        return $user->id === $business->owner_id;
    }
}

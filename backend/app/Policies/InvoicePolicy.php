<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->id === $invoice->trainer_id || $user->id === $invoice->client_id;
    }

    public function create(User $user): bool
    {
        return $user->isTrainer();
    }

    /** Trainer may change any field. Client may only mark their own invoice paid. */
    public function update(User $user, Invoice $invoice): bool
    {
        return $user->id === $invoice->trainer_id;
    }

    public function markPaid(User $user, Invoice $invoice): bool
    {
        return $user->id === $invoice->client_id;
    }
}

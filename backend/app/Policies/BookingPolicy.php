<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Booking $booking): bool
    {
        if ($user->id === $booking->trainer_id) {
            return true;
        }

        return $booking->attendees()->where('users.id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isTrainer();
    }

    public function update(User $user, Booking $booking): bool
    {
        return $user->id === $booking->trainer_id;
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $this->update($user, $booking);
    }

    /** Adding an attendee to the booking (self-join for clients, add-anyone for the owning trainer). */
    public function addAttendee(User $user, Booking $booking, int $targetClientId): bool
    {
        if ($user->id === $booking->trainer_id) {
            return true;
        }

        return $user->isClient() && $user->id === $targetClientId;
    }

    public function removeAttendee(User $user, Booking $booking, int $targetClientId): bool
    {
        return $this->addAttendee($user, $booking, $targetClientId);
    }
}

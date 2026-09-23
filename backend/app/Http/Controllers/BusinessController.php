<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookingResource;
use App\Http\Resources\BusinessInviteResource;
use App\Http\Resources\BusinessResource;
use App\Http\Resources\PayrollEntryResource;
use App\Mail\BusinessInviteMail;
use App\Models\Booking;
use App\Models\Business;
use App\Models\BusinessInvite;
use App\Models\PayrollEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BusinessController extends Controller
{
    /** Create a business/team owned by the current trainer. */
    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isTrainer(), 403);

        $profile = $user->trainerProfile;

        if ($profile->business_id) {
            throw ValidationException::withMessages([
                'business' => ['You already belong to a team.'],
            ]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $business = Business::create([
            'owner_id' => $user->id,
            'name' => $data['name'],
        ]);

        $profile->update(['business_id' => $business->id, 'business_role' => 'owner']);

        return new BusinessResource($business->load('trainerProfiles.user'));
    }

    /** The current trainer's team, with members. Null if they're independent. */
    public function me(Request $request)
    {
        $profile = $request->user()->trainerProfile;

        if (! $profile || ! $profile->business_id) {
            return response()->json(['data' => null]);
        }

        $this->authorize('view', $profile->business);

        return new BusinessResource($profile->business->load('trainerProfiles.user'));
    }

    public function update(Request $request, Business $business)
    {
        $this->authorize('manage', $business);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'brandColor' => ['nullable', 'string', 'max:32'],
            'logoUrl' => ['nullable', 'url'],
        ]);

        $business->update([
            'name' => $data['name'] ?? $business->name,
            'brand_color' => array_key_exists('brandColor', $data) ? $data['brandColor'] : $business->brand_color,
            'logo_url' => array_key_exists('logoUrl', $data) ? $data['logoUrl'] : $business->logo_url,
        ]);

        return new BusinessResource($business->load('trainerProfiles.user'));
    }

    public function invite(Request $request, Business $business)
    {
        $this->authorize('manage', $business);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $invite = BusinessInvite::create([
            'business_id' => $business->id,
            'inviter_id' => $request->user()->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'token' => Str::random(48),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $invite->load('business', 'inviter');

        Mail::to($invite->email)->send(new BusinessInviteMail($invite));

        return new BusinessInviteResource($invite);
    }

    /** Bookings across every trainer on the team, for a shared team calendar. */
    public function calendar(Request $request, Business $business)
    {
        $this->authorize('view', $business);

        $bookings = Booking::whereIn('trainer_id', $business->trainerUserIds())
            ->with('attendees.clientProfile', 'trainer')
            ->orderBy('starts_at')
            ->get();

        return BookingResource::collection($bookings);
    }

    public function payrollIndex(Request $request, Business $business)
    {
        $this->authorize('view', $business);
        $user = $request->user();

        $query = PayrollEntry::where('business_id', $business->id)->with('trainer')->orderByDesc('created_at');

        if (! $user->trainerProfile->isBusinessOwner()) {
            $query->where('trainer_id', $user->id);
        }

        return PayrollEntryResource::collection($query->get());
    }

    public function payrollStore(Request $request, Business $business)
    {
        $this->authorize('manage', $business);

        $data = $request->validate([
            'trainerId' => ['required', 'integer', 'exists:users,id'],
            'periodLabel' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        abort_unless(in_array((int) $data['trainerId'], $business->trainerUserIds(), true), 422);

        $entry = PayrollEntry::create([
            'business_id' => $business->id,
            'trainer_id' => $data['trainerId'],
            'period_label' => $data['periodLabel'],
            'amount' => $data['amount'],
            'status' => 'pending',
        ]);

        return new PayrollEntryResource($entry->load('trainer'));
    }

    public function payrollUpdate(Request $request, Business $business, PayrollEntry $payrollEntry)
    {
        $this->authorize('manage', $business);
        abort_unless($payrollEntry->business_id === $business->id, 404);

        $data = $request->validate([
            'status' => ['required', 'in:pending,paid'],
        ]);

        $payrollEntry->update([
            'status' => $data['status'],
            'paid_at' => $data['status'] === 'paid' ? now() : null,
        ]);

        return new PayrollEntryResource($payrollEntry->load('trainer'));
    }
}

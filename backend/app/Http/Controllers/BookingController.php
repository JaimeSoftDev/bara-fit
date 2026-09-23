<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Booking::class);

        $user = $request->user();

        if ($user->isTrainer()) {
            $bookings = Booking::where('trainer_id', $user->id)
                ->with('attendees.clientProfile')
                ->orderBy('starts_at')
                ->get();
        } else {
            $bookings = Booking::whereHas('attendees', fn ($q) => $q->where('users.id', $user->id)
                ->where('booking_attendees.status', '!=', 'cancelled'))
                ->with('attendees.clientProfile')
                ->orderBy('starts_at')
                ->get();
        }

        return BookingResource::collection($bookings);
    }

    /**
     * Upcoming group classes from the client's own trainer that still have
     * open spots and the client hasn't joined yet.
     */
    public function available(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isClient(), 403);

        $trainerId = $user->clientProfile?->trainer_id;

        $bookings = Booking::where('trainer_id', $trainerId)
            ->where('type', 'class')
            ->where('status', '!=', 'cancelled')
            ->where('starts_at', '>=', now())
            ->whereDoesntHave('attendees', fn ($q) => $q->where('users.id', $user->id)
                ->where('booking_attendees.status', '!=', 'cancelled'))
            ->with('attendees.clientProfile')
            ->orderBy('starts_at')
            ->get()
            ->filter(fn (Booking $booking) => $booking->capacity === null || $booking->activeAttendees()->count() < $booking->capacity)
            ->values();

        return BookingResource::collection($bookings);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Booking::class);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:session,class'],
            'startsAt' => ['required', 'date'],
            'endsAt' => ['required', 'date', 'after:startsAt'],
            'status' => ['nullable', 'in:confirmed,pending,cancelled,completed'],
            'location' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'clientId' => ['nullable', 'integer', 'exists:users,id'],
            'attendeeIds' => ['nullable', 'array'],
            'attendeeIds.*' => ['integer', 'exists:users,id'],
            'recurrence' => ['nullable', 'array'],
            'recurrence.freq' => ['required_with:recurrence', 'in:weekly'],
            'recurrence.until' => ['required_with:recurrence', 'date'],
        ]);

        if ($data['type'] === 'session' && empty($data['clientId'])) {
            throw ValidationException::withMessages([
                'clientId' => ['clientId is required for a 1:1 session booking.'],
            ]);
        }

        if ($data['type'] === 'class' && empty($data['capacity'])) {
            throw ValidationException::withMessages([
                'capacity' => ['capacity is required for a class booking.'],
            ]);
        }

        $attendeeIds = $data['type'] === 'session'
            ? [$data['clientId']]
            : ($data['attendeeIds'] ?? []);

        if ($data['type'] === 'class' && count($attendeeIds) > $data['capacity']) {
            throw ValidationException::withMessages([
                'attendeeIds' => ['Number of attendees exceeds capacity.'],
            ]);
        }

        $trainerId = $request->user()->id;
        $seriesId = isset($data['recurrence']) ? (string) Str::uuid() : null;

        $occurrences = $this->buildOccurrences($data['startsAt'], $data['endsAt'], $data['recurrence'] ?? null);

        $bookings = DB::transaction(function () use ($occurrences, $data, $trainerId, $seriesId, $attendeeIds) {
            $created = collect();

            foreach ($occurrences as [$startsAt, $endsAt]) {
                $booking = Booking::create([
                    'trainer_id' => $trainerId,
                    'title' => $data['title'],
                    'type' => $data['type'],
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'status' => $data['status'] ?? 'confirmed',
                    'location' => $data['location'] ?? null,
                    'notes' => $data['notes'] ?? null,
                    'capacity' => $data['type'] === 'class' ? $data['capacity'] : null,
                    'series_id' => $seriesId,
                ]);

                foreach ($attendeeIds as $clientId) {
                    $booking->attendees()->attach($clientId, ['status' => 'confirmed']);
                }

                $created->push($booking);
            }

            return $created;
        });

        $bookings->each->load('attendees.clientProfile');

        if ($bookings->count() > 1) {
            return BookingResource::collection($bookings)->response()->setStatusCode(201);
        }

        return (new BookingResource($bookings->first()))->response()->setStatusCode(201);
    }

    public function update(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        $data = $request->validate([
            'status' => ['sometimes', 'in:confirmed,pending,cancelled,completed'],
            'title' => ['sometimes', 'string', 'max:255'],
            'startsAt' => ['sometimes', 'date'],
            'endsAt' => ['sometimes', 'date'],
            'location' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $booking->update([
            'status' => $data['status'] ?? $booking->status,
            'title' => $data['title'] ?? $booking->title,
            'starts_at' => $data['startsAt'] ?? $booking->starts_at,
            'ends_at' => $data['endsAt'] ?? $booking->ends_at,
            'location' => array_key_exists('location', $data) ? $data['location'] : $booking->location,
            'notes' => array_key_exists('notes', $data) ? $data['notes'] : $booking->notes,
        ]);

        return new BookingResource($booking->load('attendees.clientProfile'));
    }

    public function destroy(Request $request, Booking $booking)
    {
        $this->authorize('delete', $booking);

        $booking->delete();

        return response()->json(null, 204);
    }

    public function destroySeries(Request $request, string $seriesId)
    {
        $bookings = Booking::where('series_id', $seriesId)->get();

        abort_if($bookings->isEmpty(), 404);

        foreach ($bookings as $booking) {
            $this->authorize('delete', $booking);
        }

        Booking::where('series_id', $seriesId)->delete();

        return response()->json(null, 204);
    }

    public function addAttendee(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'clientId' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $targetClientId = $data['clientId'] ?? $request->user()->id;

        $this->authorize('addAttendee', [$booking, $targetClientId]);

        $client = User::where('id', $targetClientId)->where('role', 'client')->firstOrFail();

        $existing = $booking->attendees()->where('users.id', $client->id)->first();

        if ($existing && $existing->pivot->status !== 'cancelled') {
            return new BookingResource($booking->fresh()->load('attendees.clientProfile'));
        }

        if ($booking->type === 'class' && $booking->capacity !== null) {
            $activeCount = $booking->activeAttendees()->count();

            if ($activeCount >= $booking->capacity) {
                throw ValidationException::withMessages([
                    'capacity' => ['This class is already at full capacity.'],
                ]);
            }
        }

        if ($booking->type === 'session' && $booking->activeAttendees()->count() >= 1) {
            throw ValidationException::withMessages([
                'clientId' => ['This session already has an attendee.'],
            ]);
        }

        if ($existing) {
            $booking->attendees()->updateExistingPivot($client->id, ['status' => 'confirmed']);
        } else {
            $booking->attendees()->attach($client->id, ['status' => 'confirmed']);
        }

        return new BookingResource($booking->fresh()->load('attendees.clientProfile'));
    }

    public function removeAttendee(Request $request, Booking $booking, User $client)
    {
        $this->authorize('removeAttendee', [$booking, $client->id]);

        $booking->attendees()->updateExistingPivot($client->id, ['status' => 'cancelled']);

        return new BookingResource($booking->fresh()->load('attendees.clientProfile'));
    }

    /**
     * @return array<int, array{0: Carbon, 1: Carbon}>
     */
    private function buildOccurrences(string $startsAt, string $endsAt, ?array $recurrence): array
    {
        $start = Carbon::parse($startsAt);
        $end = Carbon::parse($endsAt);
        $duration = $start->diffInSeconds($end);

        if (! $recurrence) {
            return [[$start, $end]];
        }

        $until = Carbon::parse($recurrence['until'])->endOfDay();
        $occurrences = [];
        $cursor = $start->copy();

        while ($cursor->lessThanOrEqualTo($until)) {
            $occurrences[] = [$cursor->copy(), $cursor->copy()->addSeconds($duration)];
            $cursor = $cursor->copy()->addWeek();
        }

        return $occurrences;
    }
}

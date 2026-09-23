<?php

namespace App\Http\Controllers;

use App\Http\Resources\InviteResource;
use App\Http\Resources\UserResource;
use App\Mail\ClientInviteMail;
use App\Models\ClientProfile;
use App\Models\Invite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $this->authorize('viewAny', ClientProfile::class);

        if ($user->isTrainer()) {
            $clients = User::where('role', 'client')
                ->whereHas('clientProfile', fn ($q) => $q->where('trainer_id', $user->id))
                ->with('clientProfile')
                ->get();
        } else {
            $clients = User::where('id', $user->id)->with('clientProfile')->get();
        }

        return UserResource::collection($clients);
    }

    public function show(Request $request, User $client)
    {
        abort_unless($client->role === 'client', 404);

        $client->loadMissing('clientProfile');
        $this->authorize('view', $client->clientProfile);

        return new UserResource($client);
    }

    /** Trainer invites a new client by email (invite-link flow, replaces direct account creation). */
    public function invite(Request $request)
    {
        abort_unless($request->user()->isTrainer(), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'goal' => ['nullable', 'string'],
            'heightCm' => ['nullable', 'integer', 'min:0'],
        ]);

        $invite = Invite::create([
            'trainer_id' => $request->user()->id,
            'email' => $data['email'],
            'name' => $data['name'],
            'goal' => $data['goal'] ?? null,
            'height_cm' => $data['heightCm'] ?? null,
            'token' => Str::random(48),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        $invite->load('trainer');

        Mail::to($invite->email)->send(new ClientInviteMail($invite));

        return new InviteResource($invite);
    }
}

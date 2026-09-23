<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\ClientProfile;
use App\Models\Invite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InviteController extends Controller
{
    public function show(string $token)
    {
        $invite = Invite::where('token', $token)->with('trainer')->first();

        abort_if(! $invite, 404);

        if ($invite->status === 'accepted') {
            abort(410, 'This invitation has already been accepted.');
        }

        if ($invite->isExpired()) {
            $invite->update(['status' => 'expired']);
        }

        if ($invite->status === 'expired') {
            abort(410, 'This invitation has expired.');
        }

        return response()->json([
            'name' => $invite->name,
            'email' => $invite->email,
            'trainerName' => $invite->trainer->name,
            'status' => $invite->status,
        ]);
    }

    public function accept(Request $request, string $token)
    {
        $invite = Invite::where('token', $token)->first();

        abort_if(! $invite, 404);
        abort_if($invite->status === 'accepted', 410, 'This invitation has already been accepted.');

        if ($invite->isExpired()) {
            $invite->update(['status' => 'expired']);
        }

        abort_if($invite->status === 'expired', 410, 'This invitation has expired.');

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = DB::transaction(function () use ($invite, $data) {
            $user = User::create([
                'name' => $invite->name,
                'email' => $invite->email,
                'password' => Hash::make($data['password']),
                'role' => 'client',
            ]);

            ClientProfile::create([
                'user_id' => $user->id,
                'trainer_id' => $invite->trainer_id,
                'goal' => $invite->goal,
                'height_cm' => $invite->height_cm,
                'start_weight_kg' => 0,
            ]);

            $invite->update(['status' => 'accepted', 'accepted_at' => now()]);

            return $user;
        });

        $user->load('clientProfile');
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }
}

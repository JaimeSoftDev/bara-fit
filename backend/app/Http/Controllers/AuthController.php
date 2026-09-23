<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\ClientProfile;
use App\Models\TrainerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'specialties' => ['array'],
            'specialties.*' => ['string'],
            'bio' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'trainer',
        ]);

        TrainerProfile::create([
            'user_id' => $user->id,
            'specialties' => $data['specialties'] ?? [],
            'bio' => $data['bio'] ?? '',
        ]);

        $token = $user->createToken('auth')->plainTextToken;
        $user->load('trainerProfile.business');

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;
        $user->load(['trainerProfile.business', 'clientProfile.trainer.trainerProfile.business']);

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['trainerProfile.business', 'clientProfile.trainer.trainerProfile.business']);

        return new UserResource($user);
    }

    /** Trainer updates their own profile: bio, specialties, and personal branding (used when not on a team, or as their fallback). */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isTrainer(), 403);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'specialties' => ['sometimes', 'array'],
            'specialties.*' => ['string'],
            'brandColor' => ['nullable', 'string', 'max:32'],
            'logoUrl' => ['nullable', 'url'],
        ]);

        if (array_key_exists('name', $data)) {
            $user->update(['name' => $data['name']]);
        }

        $profile = $user->trainerProfile;
        $profile->update([
            'bio' => array_key_exists('bio', $data) ? $data['bio'] : $profile->bio,
            'specialties' => $data['specialties'] ?? $profile->specialties,
            'brand_color' => array_key_exists('brandColor', $data) ? $data['brandColor'] : $profile->brand_color,
            'logo_url' => array_key_exists('logoUrl', $data) ? $data['logoUrl'] : $profile->logo_url,
        ]);

        $user->load('trainerProfile.business');

        return new UserResource($user);
    }

    /**
     * Upload a logo image. If the trainer owns a business, it becomes the
     * team's shared logo; otherwise it's their own personal fallback logo.
     */
    public function uploadLogo(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isTrainer(), 403);

        $request->validate([
            'logo' => ['required', 'image', 'max:5120'],
        ]);

        $path = $request->file('logo')->store('brand-logos', 'public');
        $url = \Illuminate\Support\Facades\Storage::disk('public')->url($path);

        $profile = $user->trainerProfile;

        if ($profile->business_id && $profile->isBusinessOwner()) {
            $profile->business->update(['logo_url' => $url]);
        } else {
            $profile->update(['logo_url' => $url]);
        }

        $user->load('trainerProfile.business');

        return new UserResource($user);
    }
}

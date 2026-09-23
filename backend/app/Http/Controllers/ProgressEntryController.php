<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProgressEntryResource;
use App\Models\ProgressEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProgressEntryController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProgressEntry::class);

        $user = $request->user();
        $query = ProgressEntry::query()->orderByDesc('date');

        if ($user->isTrainer()) {
            $clientIds = $user->clients()->pluck('user_id');
            $query->whereIn('client_id', $clientIds);
        } else {
            $query->where('client_id', $user->id);
        }

        if ($request->filled('clientId')) {
            $query->where('client_id', $request->query('clientId'));
        }

        return ProgressEntryResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'clientId' => ['nullable', 'integer', 'exists:users,id'],
            'date' => ['required', 'date'],
            'weightKg' => ['required', 'numeric'],
            'bodyFatPct' => ['nullable', 'numeric'],
            'measurements' => ['nullable', 'array'],
            'measurements.chestCm' => ['nullable', 'numeric'],
            'measurements.waistCm' => ['nullable', 'numeric'],
            'measurements.hipsCm' => ['nullable', 'numeric'],
            'measurements.armCm' => ['nullable', 'numeric'],
            'measurements.thighCm' => ['nullable', 'numeric'],
            'note' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:10240'],
        ]);

        $targetClientId = $data['clientId'] ?? $request->user()->id;

        $this->authorize('createFor', [ProgressEntry::class, (int) $targetClientId]);

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('progress-photos', 'public');
            $photoUrl = Storage::disk('public')->url($path);
        }

        $entry = ProgressEntry::create([
            'client_id' => $targetClientId,
            'date' => $data['date'],
            'weight_kg' => $data['weightKg'],
            'body_fat_pct' => $data['bodyFatPct'] ?? null,
            'measurements' => $data['measurements'] ?? null,
            'photo_url' => $photoUrl,
            'note' => $data['note'] ?? null,
        ]);

        return (new ProgressEntryResource($entry))->response()->setStatusCode(201);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Conversation::class);

        $user = $request->user();

        if ($user->isTrainer()) {
            // Ensure every client of this trainer has a conversation to message into
            // (conversations are otherwise find-or-created lazily on first message).
            foreach ($user->clients()->pluck('user_id') as $clientId) {
                Conversation::firstOrCreate(['trainer_id' => $user->id, 'client_id' => $clientId]);
            }

            $conversations = Conversation::where('trainer_id', $user->id)->get();
        } else {
            $trainerId = $user->clientProfile?->trainer_id;
            $conversations = $trainerId
                ? Conversation::where('client_id', $user->id)
                    ->where('trainer_id', $trainerId)
                    ->get()
                    ->when(
                        fn ($collection) => $collection->isEmpty(),
                        fn () => collect([Conversation::firstOrCreate(['trainer_id' => $trainerId, 'client_id' => $user->id])])
                    )
                : collect();
        }

        return ConversationResource::collection($conversations);
    }

    public function messages(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        return MessageResource::collection($conversation->messages);
    }

    public function storeMessage(Request $request, Conversation $conversation)
    {
        $this->authorize('participate', $conversation);

        $data = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'text' => $data['text'],
        ]);

        return (new MessageResource($message))->response()->setStatusCode(201);
    }
}

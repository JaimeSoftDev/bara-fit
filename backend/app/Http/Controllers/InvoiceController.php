<?php

namespace App\Http\Controllers;

use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

        $user = $request->user();
        $query = Invoice::query()->orderByDesc('issued_at');

        if ($user->isTrainer()) {
            $query->where('trainer_id', $user->id);
        } else {
            $query->where('client_id', $user->id);
        }

        if ($request->filled('clientId')) {
            $query->where('client_id', $request->query('clientId'));
        }

        return InvoiceResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $this->authorize('create', Invoice::class);

        $data = $request->validate([
            'clientId' => ['required', 'integer', 'exists:users,id'],
            'concept' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:paid,pending,overdue'],
            'issuedAt' => ['required', 'date'],
            'dueDate' => ['required', 'date'],
        ]);

        $invoice = Invoice::create([
            'trainer_id' => $request->user()->id,
            'client_id' => $data['clientId'],
            'concept' => $data['concept'],
            'amount' => $data['amount'],
            'status' => $data['status'] ?? 'pending',
            'issued_at' => $data['issuedAt'],
            'due_date' => $data['dueDate'],
            'paid_at' => ($data['status'] ?? null) === 'paid' ? now() : null,
        ]);

        return (new InvoiceResource($invoice))->response()->setStatusCode(201);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'status' => ['required', 'in:paid,pending,overdue'],
        ]);

        if ($request->user()->id === $invoice->trainer_id) {
            $this->authorize('update', $invoice);
        } else {
            $this->authorize('markPaid', $invoice);
            abort_unless($data['status'] === 'paid', 403, 'Clients may only mark an invoice as paid.');
        }

        $invoice->update([
            'status' => $data['status'],
            'paid_at' => $data['status'] === 'paid' ? ($invoice->paid_at ?? now()) : null,
        ]);

        return new InvoiceResource($invoice);
    }
}

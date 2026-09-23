<?php

namespace App\Mail;

use App\Models\Invite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $acceptUrl;

    public function __construct(public Invite $invite)
    {
        $this->acceptUrl = rtrim(config('app.frontend_url'), '/')."/invite/{$invite->token}";
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to train with BaraFit",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.client-invite',
            with: [
                'name' => $this->invite->name,
                'trainerName' => $this->invite->trainer->name,
                'acceptUrl' => $this->acceptUrl,
            ],
        );
    }
}

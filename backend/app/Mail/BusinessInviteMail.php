<?php

namespace App\Mail;

use App\Models\BusinessInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BusinessInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $acceptUrl;

    public function __construct(public BusinessInvite $invite)
    {
        $this->acceptUrl = rtrim(config('app.frontend_url'), '/')."/team-invite/{$invite->token}";
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to join a team on BaraFit",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.business-invite',
            with: [
                'name' => $this->invite->name,
                'businessName' => $this->invite->business->name,
                'inviterName' => $this->invite->inviter->name,
                'acceptUrl' => $this->acceptUrl,
            ],
        );
    }
}

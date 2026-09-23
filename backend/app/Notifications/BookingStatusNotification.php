<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class BookingStatusNotification extends Notification
{
    /**
     * @param  'confirmed'|'cancelled'  $status
     */
    public function __construct(
        private readonly string $bookingTitle,
        private readonly string $status,
        private readonly string $url,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, self $notification): WebPushMessage
    {
        $title = $this->status === 'confirmed' ? 'Reserva confirmada' : 'Reserva cancelada';
        $body = $this->status === 'confirmed'
            ? "Tu reserva \"{$this->bookingTitle}\" ha sido confirmada."
            : "Tu reserva \"{$this->bookingTitle}\" ha sido cancelada.";

        return (new WebPushMessage)
            ->title($title)
            ->icon('/icons/icon-192.png')
            ->body($body)
            ->data(['url' => $this->url]);
    }
}

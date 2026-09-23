<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NewMessageNotification extends Notification
{
    public function __construct(
        private readonly string $senderName,
        private readonly string $messageText,
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
        return (new WebPushMessage)
            ->title("Nuevo mensaje de {$this->senderName}")
            ->icon('/icons/icon-192.png')
            ->body(Str::limit($this->messageText, 120))
            ->data(['url' => $this->url]);
    }
}

@component('mail::message')
# You're invited to BaraFit

Hi {{ $name }},

{{ $trainerName }} has invited you to join BaraFit as a client, so you can track your workouts, nutrition and progress together.

@component('mail::button', ['url' => $acceptUrl])
Accept invitation
@endcomponent

Or copy and paste this link into your browser:

{{ $acceptUrl }}

This invitation expires in 7 days.

Thanks,<br>
The BaraFit Team
@endcomponent

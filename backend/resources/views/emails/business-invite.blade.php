@component('mail::message')
# You're invited to join a team on BaraFit

Hi {{ $name }},

{{ $inviterName }} has invited you to join **{{ $businessName }}** as a trainer on BaraFit.

@component('mail::button', ['url' => $acceptUrl])
Accept invitation
@endcomponent

Or copy and paste this link into your browser:

{{ $acceptUrl }}

This invitation expires in 7 days.

Thanks,<br>
The BaraFit Team
@endcomponent

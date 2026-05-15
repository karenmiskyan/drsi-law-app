<x-mail::message>
# New Application Submitted

A client has submitted their **Stage 1** application and it is ready for your review.

---

**Application #{{ $application->id }}**

<x-mail::table>
| | Petitioner | Beneficiary |
|:------|:-----------|:------------|
| **Name** | {{ $petitioner['fullName'] ?? '—' }} | {{ $beneficiary['fullName'] ?? '—' }} |
| **Email** | {{ $petitioner['email'] ?? '—' }} | {{ $beneficiary['email'] ?? '—' }} |
| **Phone** | {{ ($petitioner['phoneCountryCode'] ?? '') . ' ' . ($petitioner['phoneNumber'] ?? '—') }} | {{ ($beneficiary['phoneCountryCode'] ?? '') . ' ' . ($beneficiary['phoneNumber'] ?? '—') }} |
| **Date of Birth** | {{ $petitioner['dateOfBirth'] ?? '—' }} | {{ $beneficiary['dateOfBirth'] ?? '—' }} |
| **Country of Birth** | {{ $petitioner['countryOfBirth'] ?? '—' }} | {{ $beneficiary['countryOfBirth'] ?? '—' }} |
</x-mail::table>

**Submitted at:** {{ $application->stage1_submitted_at->format('M d, Y — h:i A') }}

Please review the full application details and uploaded documents in the admin panel.

<x-mail::button :url="$adminUrl" color="primary">
Review Application in Admin Panel
</x-mail::button>

---

<small>This is an automated notification from the DRSI Law application portal.</small>

Regards,<br>
**DRSI Law — D. R. Sklar & Associates**<br>
Immigration Law Offices
</x-mail::message>

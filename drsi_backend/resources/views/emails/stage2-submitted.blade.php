<x-mail::message>
# Stage 2 Documents Submitted for Review

The client has uploaded their **Stage 2 (NVC) documents** and is requesting your review.

---

**Application #{{ $application->id }}**

<x-mail::table>
| | Petitioner | Beneficiary |
|:------|:-----------|:------------|
| **Name** | {{ $petitioner['fullName'] ?? '—' }} | {{ $beneficiary['fullName'] ?? '—' }} |
| **Email** | {{ $petitioner['email'] ?? '—' }} | {{ $beneficiary['email'] ?? '—' }} |
</x-mail::table>

**Total documents uploaded:** {{ $application->documents()->count() }}

Please review all documents in the admin panel. You can **Approve**, **Reject**, or **Comment** on each document individually. Once satisfied, use the **"Mark Completed"** action to finalize the case.

<x-mail::button :url="$adminUrl" color="primary">
Review Documents in Admin Panel
</x-mail::button>

---

<small>This is an automated notification from the DRSI Law application portal.</small>

Regards,<br>
**DRSI Law — D. R. Sklar & Associates**<br>
Immigration Law Offices
</x-mail::message>

<x-mail::message>
# Action Required — Document Revision Needed

Dear **{{ $userName }}**,

We have reviewed your uploaded documents and unfortunately one of them could not be accepted in its current form.

---

### Document Details

**Document:** {{ $documentType }}

**Reason for Rejection:**

<x-mail::panel>
{{ $adminComment }}
</x-mail::panel>

### What You Need To Do

1. **Log in** to the DRSI Law portal
2. Locate the rejected document (highlighted in red)
3. **Re-upload** a corrected version
4. Our team will review the new file promptly

<x-mail::button :url="$portalUrl" color="primary">
Log In to Fix Documents
</x-mail::button>

---

If you have any questions about what is needed, please don't hesitate to contact our office.

Best regards,<br>
**DRSI Law — D. R. Sklar & Associates**<br>
Immigration Law Offices
</x-mail::message>

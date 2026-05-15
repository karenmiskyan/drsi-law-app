/**
 * Stage 2 list of documents - POST approval of I-130
 * Full text from docx - no information omitted.
 */

// Israel application URLs (from client)
export const ISRAEL_CRIMINAL_LINK = 'https://auth.govforms.gov.il/mw/forms/criminaltrafficdocument@police.gov.il?gbxid=0';
export const ISRAEL_MILITARY_LINK = 'https://ishurim.prat.idf.il/Account/Login?ReturnUrl=%2f%3fAspxAutoDetectCookieSupport%3d1&AspxAutoDetectCookieSupport=1';
export const LEASE_DRAFT_LINK = 'https://drive.google.com/open?id=1Fn0C0o7OUtR5DG6AH_qGKsme7767H-IyqBkwHbOJbKY&usp=drive_copy';

export interface Stage2DocItem {
  id: string;
  label: string;
  /** Optional sub-note (e.g. for Lease Agreement) */
  subNote?: string;
  /** URL for "apply via this link" in label */
  linkUrl?: string;
  /** Text to show as clickable link in label */
  linkText?: string;
  /** URL for link in subNote (e.g. "draft") */
  subNoteLinkUrl?: string;
  subNoteLinkText?: string;
}

const doc = (
  id: string,
  label: string,
  opts?: { subNote?: string; linkUrl?: string; linkText?: string; subNoteLinkUrl?: string; subNoteLinkText?: string }
): Stage2DocItem => (opts ? { id, label, ...opts } : { id, label });

// List of documents required from the US Citizens Sponsor
export const SPONSOR_DOCUMENTS: Stage2DocItem[] = [
  doc('sponsor-w2-1099', 'W2s or 1099s from the USA for most recent annual year, if any'),
  doc('sponsor-payslips-current', 'Payslips for the last 3 months from all your current employers'),
  doc('sponsor-payslips-previous', 'Payslips received in current year for previous employers'),
  doc('sponsor-additional-income', 'Additional income documents, if any, such as rental income, passive or stocks'),
  doc('sponsor-assets', 'Assets: bank statement; investment account; etc.'),
];

// List of documents required from the foreign Beneficiary
export const BENEFICIARY_DOCUMENTS: Stage2DocItem[] = [
  doc('ben-police-lived', 'Police Clearance - we need a police clearance certificate from every country you ever lived in for more than 6 months. If you have lived in any other countries, please let us know.'),
  doc('ben-police-citizenship', 'Police Clearance - we need a police clearance certificate from every country you have citizenship of that country and ever visited.'),
  doc(
    'ben-israel-criminal',
    'For Israel - please apply via this link and request a Criminal Information Certificate (תעודת מרשם פלילי) to be sent to the US Embassy in Jerusalem (שגרירות ארה"ב - ירושלים). Send us the summary page you received in the email.',
    { linkUrl: ISRAEL_CRIMINAL_LINK, linkText: 'this link' }
  ),
  doc(
    'ben-israel-military',
    'Military Service - For the exemption certificate from military service in the IDF, please apply via this link and request Tofes 830 and the exemption certificate.',
    { linkUrl: ISRAEL_MILITARY_LINK, linkText: 'this link' }
  ),
  doc('ben-immunization', 'Immunization Record - Please prepare your immunization record so you can have it in your medical examination before the interview.'),
];

// Intent to Establish a home in the USA - this will show your intent to relocate to the US.
export const INTENT_DOCUMENTS: Stage2DocItem[] = [
  doc(
    'intent-lease',
    'Lease Agreement, or contacting a realtor in the US (emails, etc.)',
    {
      subNote: 'If you do not secure a lease agreement before the interview, you can send an agreement with relatives - draft.',
      subNoteLinkUrl: LEASE_DRAFT_LINK,
      subNoteLinkText: 'draft',
    }
  ),
  doc('intent-bank', 'US bank account statement with new funds / Transferring funds/investments to the United States'),
  doc('intent-schools', 'Registering children in U.S. schools, or contacting schools in search (emails, etc.)'),
];

// For your interview, you'll need the following in the original:
export const INTERVIEW_ORIGINALS = [
  'Birth certificates',
  'Marriage certificate',
  'Change of name certificate',
  'Passports and visas',
  '2 Passport photos (2"x2")',
];

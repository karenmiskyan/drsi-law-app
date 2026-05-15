/**
 * Helpers for the split-name system.
 *
 * Per Meir's feedback ("Names - split into First, middle, and Surnames"), names are
 * stored as nested { firstName, middleName, surname }. For backward compatibility
 * and to keep existing Filament / PDF / admin rendering code working unchanged, we
 * also auto-compute a `fullName` string whenever the form is saved.
 *
 * Automation in later step labels uses `firstName` only (Meir: "In the automation in
 * the form, use only the First name").
 */

export interface NameParts {
  firstName?: string;
  middleName?: string;
  surname?: string;
}

/** "Meir" + "David" + "Sklar" → "Meir David Sklar" */
export function composeFullName(p: NameParts): string {
  return [p.firstName, p.middleName, p.surname]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

/**
 * "Meir David Sklar" → { firstName: 'Meir', middleName: 'David', surname: 'Sklar' }
 * "Meir"             → { firstName: 'Meir', middleName: '',      surname: '' }
 * "Meir Sklar"       → { firstName: 'Meir', middleName: '',      surname: 'Sklar' }
 * ""                 → { firstName: '',     middleName: '',      surname: '' }
 *
 * Used during hydration to migrate existing records that only have `fullName`.
 */
export function splitFullName(full: string | undefined | null): Required<NameParts> {
  const words = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { firstName: '', middleName: '', surname: '' };
  if (words.length === 1) return { firstName: words[0], middleName: '', surname: '' };
  if (words.length === 2) return { firstName: words[0], middleName: '', surname: words[1] };
  return {
    firstName: words[0],
    surname: words[words.length - 1],
    middleName: words.slice(1, -1).join(' '),
  };
}

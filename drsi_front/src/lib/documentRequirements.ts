/**
 * Stage 1 document requirements — rewritten per Meir's feedback in the comments.docx review.
 *
 * Design principles:
 *   1. Labels use dynamic {name} templates — replaced with the person's firstName at render time
 *      (Meir: "Can we still have the names instead of 'petitioner' or 'beneficiary'?")
 *   2. Documents are grouped by category for clearer organisation in the UI.
 *   3. `multi: true` docs can be uploaded multiple times ("Add another passport").
 *   4. Visibility can be gated by a `showIf` predicate over the form data (e.g. children docs
 *      only show when `numberOfAllChildren > 0`; divorce decree only when prior marriages > 0).
 *   5. Case-type filtering stays: spouse-only / child-only / parent-only / all.
 *
 * Children documents are generated dynamically per child so each child gets its own labelled
 * slot (and the US-passport slot only appears when the child is marked US citizen).
 */

export type DocCategory = 'petitioner' | 'beneficiary' | 'children' | 'bonafide' | 'interview_originals';

export interface DocContext {
  caseType: 'spouse' | 'child_minor' | 'child_adult' | 'parent' | null;
  citizenshipStatus: 'citizen' | 'greencard_holder' | null;
  petitionerFirstName: string;
  beneficiaryFirstName: string;
  numberOfAllChildren: number;
  children: Array<{ nameSurname?: string; isUSCitizen?: boolean | null }>;
  priorMarriagesPetitioner: number;
  priorMarriagesBeneficiary: number;
}

export interface DocumentRequirement {
  id: string;
  /** Use `{name}` placeholder — replaced at render time with the person's first name. */
  labelTemplate: string;
  required: boolean;
  category: DocCategory;
  translationEligible: boolean;
  /** Default: false. When true, UI shows "Add another" button to upload additional copies. */
  multi?: boolean;
  /** Default: 'all'. Limit to specific case types. Spouse-only / child-only / parent-only. */
  caseTypes?: Array<'spouse' | 'child' | 'parent'> | 'all';
  /** Optional visibility guard evaluated against DocContext. */
  showIf?: (ctx: DocContext) => boolean;
}

export interface ResolvedDocument {
  id: string;
  label: string;
  required: boolean;
  category: DocCategory;
  translationEligible: boolean;
  multi: boolean;
}

// ─── Source of truth: document catalogue ─────────────────────────────────────

const CATALOGUE: DocumentRequirement[] = [
  // ── Petitioner ──
  { id: 'pet-us-passport', labelTemplate: '{name}: US Passport', required: true, category: 'petitioner', translationEligible: false },
  { id: 'pet-israeli-passport', labelTemplate: '{name}: Israeli Passport', required: false, category: 'petitioner', translationEligible: false },
  { id: 'pet-other-passport', labelTemplate: '{name}: Any Other Passport', required: false, category: 'petitioner', translationEligible: false, multi: true },
  { id: 'pet-citizenship-cert', labelTemplate: '{name}: US Citizenship / Naturalization Certificate (if any)', required: false, category: 'petitioner', translationEligible: true },
  { id: 'pet-birth-cert', labelTemplate: '{name}: Birth Certificate (in English)', required: true, category: 'petitioner', translationEligible: true },
  { id: 'pet-divorce-cert', labelTemplate: '{name}: Divorce Certificate (if any)', required: false, category: 'petitioner', translationEligible: true, multi: true,
    showIf: (ctx) => ctx.priorMarriagesPetitioner > 0 },
  { id: 'pet-name-change', labelTemplate: '{name}: Change of Name Certificate (if any)', required: false, category: 'petitioner', translationEligible: true, multi: true },
  { id: 'pet-passport-photo', labelTemplate: '{name}: Digital Passport Photo 2"x2"', required: true, category: 'petitioner', translationEligible: false },
  { id: 'pet-tax-return-2024', labelTemplate: '{name}: Tax Return 2024', required: true, category: 'petitioner', translationEligible: false },
  { id: 'pet-tax-return-2023', labelTemplate: '{name}: Tax Return 2023', required: true, category: 'petitioner', translationEligible: false },
  { id: 'pet-tax-return-2022', labelTemplate: '{name}: Tax Return 2022', required: true, category: 'petitioner', translationEligible: false },

  // ── Beneficiary ──
  { id: 'ben-israeli-passport', labelTemplate: '{name}: Israeli Passport', required: true, category: 'beneficiary', translationEligible: false },
  { id: 'ben-other-passport', labelTemplate: '{name}: Other Foreign Passport (if any)', required: false, category: 'beneficiary', translationEligible: false, multi: true },
  { id: 'ben-us-visa', labelTemplate: '{name}: US Visa (if any)', required: false, category: 'beneficiary', translationEligible: false },
  { id: 'ben-birth-cert', labelTemplate: '{name}: Birth Certificate (in English)', required: true, category: 'beneficiary', translationEligible: true },
  { id: 'ben-marriage-cert', labelTemplate: 'Marriage Certificate', required: true, category: 'beneficiary', translationEligible: true, caseTypes: ['spouse'] },
  { id: 'ben-divorce-cert', labelTemplate: '{name}: Divorce Certificate (if any)', required: false, category: 'beneficiary', translationEligible: true, multi: true,
    showIf: (ctx) => ctx.priorMarriagesBeneficiary > 0 },
  { id: 'ben-name-change', labelTemplate: '{name}: Change of Name Certificate (if any)', required: false, category: 'beneficiary', translationEligible: true, multi: true },
  { id: 'ben-passport-photo', labelTemplate: '{name}: Digital Passport Photo 2"x2"', required: true, category: 'beneficiary', translationEligible: false },

  // ── Bona Fide Marriage (Spouse case only, per Meir's explicit list) ──
  { id: 'bona-joint-house', labelTemplate: 'Bona Fide Marriage: Joint ownership / rent of common house', required: true, category: 'bonafide', translationEligible: false, caseTypes: ['spouse'] },
  { id: 'bona-joint-accounts', labelTemplate: 'Bona Fide Marriage: Joint bank / investment / insurance accounts', required: true, category: 'bonafide', translationEligible: false, caseTypes: ['spouse'] },
  { id: 'bona-joint-utilities', labelTemplate: 'Bona Fide Marriage: Joint utility bills', required: true, category: 'bonafide', translationEligible: false, caseTypes: ['spouse'] },
  { id: 'bona-joint-travels', labelTemplate: 'Bona Fide Marriage: Joint travels (flights, hotels)', required: false, category: 'bonafide', translationEligible: false, caseTypes: ['spouse'], multi: true },
  { id: 'bona-photos', labelTemplate: 'Bona Fide Marriage: Photographs (wedding, honeymoon, family)', required: true, category: 'bonafide', translationEligible: false, caseTypes: ['spouse'], multi: true },
  { id: 'bona-affidavits', labelTemplate: 'Bona Fide Marriage: Affidavits of Relationship (3–4 required)', required: true, category: 'bonafide', translationEligible: false, caseTypes: ['spouse'], multi: true },
];

// ─── Children docs — generated dynamically per child ─────────────────────────

interface ChildDocBlueprint {
  suffix: string;
  labelSuffix: string;
  required: boolean;
  translationEligible: boolean;
  multi?: boolean;
  requiresUSCitizen?: boolean;
}

const CHILD_DOC_BLUEPRINTS: ChildDocBlueprint[] = [
  { suffix: 'us-passport', labelSuffix: 'US Passport', required: true, translationEligible: false, requiresUSCitizen: true },
  { suffix: 'israeli-passport', labelSuffix: 'Israeli Passport', required: false, translationEligible: false },
  { suffix: 'other-passport', labelSuffix: 'Any Other Passport', required: false, translationEligible: false, multi: true },
  { suffix: 'us-visa', labelSuffix: 'US Visa', required: false, translationEligible: false },
  { suffix: 'birth-cert', labelSuffix: 'Birth Certificate (in English)', required: true, translationEligible: true },
  { suffix: 'name-change', labelSuffix: 'Change of Name Certificate (if any)', required: false, translationEligible: true, multi: true },
  { suffix: 'passport-photo', labelSuffix: '2 Passport Photos 2"x2"', required: true, translationEligible: false },
];

// ─── Resolver ────────────────────────────────────────────────────────────────

function interpolate(template: string, name: string): string {
  return template.replace(/\{name\}/g, name);
}

/**
 * Resolve all document requirements for an application.
 *
 * Handles:
 *  - Dynamic person-name interpolation
 *  - Case-type filtering (spouse / child / parent)
 *  - Conditional visibility (`showIf`)
 *  - Per-child expansion with US-citizen gating on the US-passport slot
 *
 * Returns a flat list. Callers group by `category` for display.
 */
export function getDocumentsForApplication(ctx: DocContext): ResolvedDocument[] {
  // Phase 2.2: both minor and adult child cases share the "child" doc bucket.
  const normalizedCase: 'spouse' | 'child' | 'parent' | null =
    ctx.caseType === 'child_minor' || ctx.caseType === 'child_adult' ? 'child'
      : ctx.caseType === 'spouse' || ctx.caseType === 'parent' ? ctx.caseType
      : null;

  const result: ResolvedDocument[] = [];

  for (const doc of CATALOGUE) {
    // Case-type filter
    const types = doc.caseTypes ?? 'all';
    if (types !== 'all' && normalizedCase !== null && !types.includes(normalizedCase)) continue;
    if (types !== 'all' && normalizedCase === null) continue;

    // Conditional visibility
    if (doc.showIf && !doc.showIf(ctx)) continue;

    const name = doc.category === 'petitioner' ? (ctx.petitionerFirstName || 'Petitioner')
      : doc.category === 'beneficiary' ? (ctx.beneficiaryFirstName || 'Beneficiary')
      : '';

    result.push({
      id: doc.id,
      label: interpolate(doc.labelTemplate, name),
      required: doc.required,
      category: doc.category,
      translationEligible: doc.translationEligible,
      multi: doc.multi ?? false,
    });
  }

  // Expand per-child documents (only when children exist AND we're in a spouse case —
  // parent/child cases don't enumerate beneficiary's children here).
  if (normalizedCase === 'spouse' && ctx.numberOfAllChildren > 0) {
    const children = ctx.children.slice(0, ctx.numberOfAllChildren);
    children.forEach((child, idx) => {
      const childName = child.nameSurname?.trim() || `Child ${idx + 1}`;
      for (const bp of CHILD_DOC_BLUEPRINTS) {
        // Gate US-passport on isUSCitizen === true
        if (bp.requiresUSCitizen && child.isUSCitizen !== true) continue;
        result.push({
          id: `child-${idx}-${bp.suffix}`,
          label: `${childName}: ${bp.labelSuffix}`,
          required: bp.required,
          category: 'children',
          translationEligible: bp.translationEligible,
          multi: bp.multi ?? false,
        });
      }
    });
  }

  return result;
}

// ─── Backwards-compat wrapper ────────────────────────────────────────────────

/**
 * Legacy function used by older code paths (Step8Documents original implementation).
 * Returns docs filtered only by case type, with no person-name interpolation or conditionals.
 * Prefer `getDocumentsForApplication(ctx)` for all new work.
 */
export function getDocumentsForCaseType(
  caseType: 'spouse' | 'child' | 'child_minor' | 'child_adult' | 'parent',
): ResolvedDocument[] {
  return getDocumentsForApplication({
    caseType: caseType === 'child' ? 'child_minor' : caseType,
    citizenshipStatus: null,
    petitionerFirstName: 'Petitioner',
    beneficiaryFirstName: 'Beneficiary',
    numberOfAllChildren: 0,
    children: [],
    priorMarriagesPetitioner: 999, // permissive for legacy path: show optional divorce decrees
    priorMarriagesBeneficiary: 999,
  });
}

// ─── Category headings (for grouped UI rendering) ────────────────────────────

export const CATEGORY_HEADINGS: Record<DocCategory, string> = {
  petitioner: 'Petitioner Documents',
  beneficiary: 'Beneficiary Documents',
  children: 'Children Documents',
  bonafide: 'Bona Fide Marriage Evidence',
  interview_originals: 'For Your Interview (Originals to Bring)',
};

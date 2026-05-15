import { useFormStore } from '@/lib/store/formStore';
import { composeFullName } from '@/lib/nameHelpers';

/**
 * Returns dynamic display labels based on the petitioner/beneficiary names
 * currently entered in the form. Falls back to generic "Petitioner" / "Beneficiary"
 * when names are empty. Used across all step components for personalization.
 *
 * Per Meir's feedback: automation (headers, section labels) uses ONLY the first name
 * to keep labels short. Formal contexts use the full name.
 */
export function useDynamicLabels() {
  const petitioner = useFormStore((s) => s.petitioner);
  const beneficiary = useFormStore((s) => s.beneficiary);
  const caseType = useFormStore((s) => s.caseType);

  // Compose fullName from split fields, falling back to the legacy `fullName` string
  // (so records migrated from before the split still render correctly).
  const petitionerFull = composeFullName(petitioner) || (petitioner.fullName?.trim() ?? '');
  const beneficiaryFull = composeFullName(beneficiary) || (beneficiary.fullName?.trim() ?? '');

  return {
    // Short labels for automation (headers, section titles) — Meir's preferred style
    petitionerFirstName: petitioner.firstName?.trim() || petitionerFull.split(' ')[0] || 'Petitioner',
    beneficiaryFirstName: beneficiary.firstName?.trim() || beneficiaryFull.split(' ')[0] || 'Beneficiary',
    // Full names for formal rendering
    petitionerName: petitionerFull || 'Petitioner',
    beneficiaryName: beneficiaryFull || 'Beneficiary',
    caseType,
  };
}

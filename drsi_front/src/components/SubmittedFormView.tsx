import { useFormStore } from '@/lib/store/formStore';
import { composeFullName } from '@/lib/nameHelpers';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

/**
 * Read-only rendering of the submitted form, so clients can review what they sent
 * after submission. Per Meir: "as a client, if i want to go back and see my forms,
 * I can't go back and review after the submission?"
 *
 * Shows every field as a plain labelled value. No inputs, no edits.
 */

interface SubmittedFormViewProps {
  onBack: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  const display = value === '' || value === null || value === undefined ? '—' : value;
  return (
    <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-gray-100 last:border-b-0">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:col-span-1">{label}</dt>
      <dd className="text-sm text-gray-900 sm:col-span-2 break-words">{display}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-2">
      <h3 className="text-lg font-semibold text-[#b72b2b] border-b border-gray-200 pb-2 mb-3">{title}</h3>
      <dl className="space-y-0">{children}</dl>
    </section>
  );
}

function YesNo(v: boolean | null | undefined) {
  return v === true ? 'Yes' : v === false ? 'No' : '—';
}

export function SubmittedFormView({ onBack }: SubmittedFormViewProps) {
  const store = useFormStore();
  const { petitioner, beneficiary, caseType, petitionerCitizenshipStatus,
          petitionerAddress, beneficiaryAddress, futureUSAddress,
          step3Data, step5Data, step6Data, step7Data, step8Documents } = store;

  const petFull = composeFullName(petitioner) || petitioner.fullName || '—';
  const benFull = composeFullName(beneficiary) || beneficiary.fullName || '—';

  const caseTypeLabel = caseType === 'spouse' ? 'My Spouse'
    : caseType === 'child_minor' ? 'My Unmarried Minor Child'
    : caseType === 'child_adult' ? 'My Unmarried Adult Child'
    : caseType === 'parent' ? 'My Parent'
    : caseType === 'child' ? 'My Unmarried Child (legacy)'
    : '—';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to status
        </Button>
        <h2 className="text-xl font-bold text-white">Your Submitted Application</h2>
      </div>

      <div className="space-y-5">
        {/* Application Meta */}
        <Section title="Application Overview">
          <Field label="Case Type" value={caseTypeLabel} />
          <Field label="Petitioner Citizenship" value={petitionerCitizenshipStatus === 'citizen' ? 'American Citizen' : petitionerCitizenshipStatus === 'greencard_holder' ? 'Green Card Holder' : '—'} />
        </Section>

        {/* Step 1: Basic Info */}
        <Section title="Step 1 — Basic Information">
          <Field label="Petitioner — Full Name" value={petFull} />
          <Field label="Petitioner — Email" value={petitioner.email} />
          <Field label="Petitioner — Phone" value={`${petitioner.phoneCountryCode ?? ''} ${petitioner.phoneNumber ?? ''}`.trim()} />
          <Field label="Petitioner — Date of Birth" value={petitioner.dateOfBirth} />
          <Field label="Petitioner — City of Birth" value={petitioner.cityOfBirth} />
          <Field label="Petitioner — Country of Birth" value={petitioner.countryOfBirth} />
          <Field label="Petitioner — SSN" value={petitioner.socialSecurityNumber} />
          <Field label="Petitioner — A-Number" value={petitioner.aNumber} />
          <Field label="Beneficiary — Full Name" value={benFull} />
          <Field label="Beneficiary — Email" value={beneficiary.email} />
          <Field label="Beneficiary — Phone" value={`${beneficiary.phoneCountryCode ?? ''} ${beneficiary.phoneNumber ?? ''}`.trim()} />
          <Field label="Beneficiary — Date of Birth" value={beneficiary.dateOfBirth} />
          <Field label="Beneficiary — City of Birth" value={beneficiary.cityOfBirth} />
          <Field label="Beneficiary — Country of Birth" value={beneficiary.countryOfBirth} />
          <Field label="Beneficiary — SSN" value={beneficiary.socialSecurityNumber} />
          <Field label="Beneficiary — A-Number" value={beneficiary.aNumber} />
        </Section>

        {/* Step 2: Addresses */}
        <Section title="Step 2 — Address History">
          {(() => {
            const pa = petitionerAddress.currentAddress as Record<string, string> | undefined;
            const ba = beneficiaryAddress.currentAddress as Record<string, string> | undefined;
            return (
              <>
                <Field label="Petitioner Current Street" value={pa?.street} />
                <Field label="Petitioner Current City/State/ZIP" value={`${pa?.city ?? ''} ${pa?.stateOrCountry ?? ''} ${pa?.zip ?? ''}`.trim()} />
                <Field label="Beneficiary Current Street" value={ba?.street} />
                <Field label="Beneficiary Current City/State/ZIP" value={`${ba?.city ?? ''} ${ba?.stateOrCountry ?? ''} ${ba?.zip ?? ''}`.trim()} />
                <Field label="Future US Address — Host Name" value={futureUSAddress.nameOfPersonLiving} />
                <Field label="Future US Address — Full" value={`${futureUSAddress.address ?? ''} ${futureUSAddress.city ?? ''} ${futureUSAddress.state ?? ''} ${futureUSAddress.zipCode ?? ''}`.trim()} />
                <Field label="Future US Address — Delivery Address for Green Card?" value={YesNo(futureUSAddress.isGreenCardDeliveryAddress)} />
              </>
            );
          })()}
        </Section>

        {/* Step 3: Marital Status */}
        <Section title="Step 3 — Marital Status">
          {(['petitioner', 'beneficiary'] as const).map((role) => {
            const ms = step3Data[role]?.maritalStatus;
            const roleLabel = role === 'petitioner' ? 'Petitioner' : 'Beneficiary';
            return (
              <div key={role}>
                <Field label={`${roleLabel} — Times Married`} value={ms?.timesMarried ?? 0} />
                {(ms?.timesMarried ?? 0) >= 1 && (
                  <>
                    <Field label={`${roleLabel} — Current Spouse`} value={ms?.currentMarriage?.spouseName} />
                    <Field label={`${roleLabel} — Marriage Date`} value={ms?.currentMarriage?.date} />
                    <Field label={`${roleLabel} — Marriage Place`} value={`${ms?.currentMarriage?.city ?? ''} ${ms?.currentMarriage?.country ?? ''}`.trim()} />
                  </>
                )}
                {(ms?.priorMarriages ?? []).length > 0 && (
                  <Field
                    label={`${roleLabel} — Prior Marriages`}
                    value={(ms?.priorMarriages ?? []).map((pm, i) => `${i + 1}. ${pm.fullName} (married ${pm.marriageDate}, divorced ${pm.divorceDate ?? '—'})`).join(' • ')}
                  />
                )}
              </div>
            );
          })}
        </Section>

        {/* Step 4: Family — parents & children */}
        <Section title="Step 4 — Family">
          {(['petitioner', 'beneficiary'] as const).map((role) => (
            <div key={role}>
              {(['father', 'mother'] as const).map((parent) => {
                const p = (step3Data[role] as unknown as Record<string, Record<string, unknown>>)?.[parent];
                if (!p) return null;
                const parentLabel = `${role === 'petitioner' ? 'Petitioner' : 'Beneficiary'} ${parent === 'father' ? 'Father' : 'Mother'}`;
                return (
                  <Field
                    key={`${role}-${parent}`}
                    label={parentLabel}
                    value={`${p.givenNames ?? p.firstName ?? ''} ${p.surnames ?? p.surname ?? ''}`.trim() + (p.isLiving === true ? ' (living)' : p.isLiving === false ? ` (deceased ${p.yearOfDeath ?? ''})` : '')}
                  />
                );
              })}
            </div>
          ))}
          <Field label="Number of Dependent Children (Petitioner)" value={step3Data.petitioner?.numberOfDependentChildren ?? 0} />
          <Field label="Number of All Children (Beneficiary)" value={step3Data.beneficiary?.numberOfAllChildren ?? 0} />
          {(step3Data.beneficiary?.children ?? []).length > 0 && (
            <Field
              label="Children"
              value={(step3Data.beneficiary?.children ?? []).map((c, i) => `${i + 1}. ${c.nameSurname} (DOB ${c.dateOfBirth})`).join(' • ')}
            />
          )}
        </Section>

        {/* Step 5: Employment */}
        <Section title="Step 5 — Employment & Education">
          {(['petitioner', 'beneficiary'] as const).map((role) => {
            const emp = step5Data[role];
            const roleLabel = role === 'petitioner' ? 'Petitioner' : 'Beneficiary';
            return (
              <div key={role}>
                <Field label={`${roleLabel} — Status`} value={emp?.currentEmploymentStatus} />
                {(emp?.employments ?? []).map((e, i) => (
                  <Field key={i} label={`${roleLabel} Job ${i + 1}`} value={`${e.position} at ${e.employerName} (${e.fromDate} – ${e.toDate || 'present'})`} />
                ))}
              </div>
            );
          })}
        </Section>

        {/* Step 6: Other Info */}
        <Section title="Step 6 — Other Information">
          {(['petitioner', 'beneficiary'] as const).map((role) => {
            const info = step6Data[role];
            const roleLabel = role === 'petitioner' ? 'Petitioner' : 'Beneficiary';
            return (
              <div key={role}>
                <Field
                  label={`${roleLabel} — Nationalities`}
                  value={(info?.nationalities ?? []).map((n) => n.nationality + (n.passportNumber ? ` (Passport: ${n.passportNumber})` : '')).join(', ')}
                />
                <Field label={`${roleLabel} — Eye/Hair`} value={`${info?.eyeColor ?? '—'} / ${info?.hairColor ?? '—'}`} />
              </div>
            );
          })}
        </Section>

        {/* Step 7: Security */}
        <Section title="Step 7 — Security & Background">
          {(() => {
            const answers = step7Data?.securityAnswers ?? [];
            const yesCount = answers.filter((a) => a?.answer === true).length;
            const noCount = answers.filter((a) => a?.answer === false).length;
            return (
              <>
                <Field label="Total Questions Answered" value={`${yesCount + noCount} of ${answers.length}`} />
                <Field label="Yes Answers" value={yesCount} />
                <Field label="No Answers" value={noCount} />
              </>
            );
          })()}
        </Section>

        {/* Step 8: Documents */}
        <Section title="Step 8 — Uploaded Documents">
          {Object.entries(step8Documents.uploads ?? {}).length === 0 ? (
            <Field label="Documents" value="None uploaded yet" />
          ) : (
            Object.entries(step8Documents.uploads).map(([docType, upload]) => (
              <Field
                key={docType}
                label={docType.replace(/-/g, ' ')}
                value={`${upload?.fileName ?? '—'} — Status: ${upload?.documentStatus ?? 'pending'}${upload?.adminComment ? ` — Comment: ${upload.adminComment}` : ''}`}
              />
            ))
          )}
        </Section>
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to status
        </Button>
      </div>
    </div>
  );
}

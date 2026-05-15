import { useForm, useFieldArray, Controller, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { step3MaritalStatusSchema, type Step3MaritalStatusData, type PriorMarriage } from '@/lib/schemas';
import { useFormStore } from '@/lib/store/formStore';
import { useDynamicLabels } from '@/lib/useDynamicLabels';
import { formatDateInput } from '@/lib/utils';
import { useScrollToFirstError } from '@/lib/useScrollToFirstError';
import { preventEnterSubmit } from '@/lib/formKeyGuard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusIcon, Trash2Icon } from 'lucide-react';

interface Step3MaritalStatusProps {
  onBack: () => void;
  onContinue: () => void;
}

const REQUIRED_ASTERISK = <span className="text-red-500 ml-1.5">*</span>;
const INPUT_CLASS =
  'bg-white border-gray-300 py-2.5 px-3 min-h-[42px] rounded-md';

export function Step3MaritalStatus({ onBack, onContinue }: Step3MaritalStatusProps) {
  const { step3Data, setStep3Data, caseType } = useFormStore();
  const { petitionerName, beneficiaryName, petitionerFirstName } = useDynamicLabels();
  const isSpouseCase = caseType === 'spouse';

  const form = useForm<Step3MaritalStatusData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step3MaritalStatusSchema) as any,
    defaultValues: {
      petitioner: { maritalStatus: step3Data.petitioner.maritalStatus },
      beneficiary: { maritalStatus: step3Data.beneficiary.maritalStatus },
    },
  });

  useScrollToFirstError(form);
  const { watch, control, register, formState, setValue } = form;
  const petitionerPrev = useFieldArray({
    control,
    name: 'petitioner.maritalStatus.priorMarriages',
  });
  const beneficiaryPrev = useFieldArray({
    control,
    name: 'beneficiary.maritalStatus.priorMarriages',
  });

  const lastPetitionerPrevRef = useRef<HTMLDivElement | null>(null);
  const lastBeneficiaryPrevRef = useRef<HTMLDivElement | null>(null);

  const petitionerTimesMarried = watch('petitioner.maritalStatus.timesMarried');
  const beneficiaryTimesMarried = watch('beneficiary.maritalStatus.timesMarried');

  useEffect(() => {
    const subscription = watch((data) => {
      if (data?.petitioner && data?.beneficiary) {
        setStep3Data({
          petitioner: { maritalStatus: data.petitioner.maritalStatus },
          beneficiary: { maritalStatus: data.beneficiary.maritalStatus },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStep3Data]);

  const onSubmit = (data: Step3MaritalStatusData) => {
    setStep3Data({
      petitioner: { maritalStatus: data.petitioner.maritalStatus },
      beneficiary: { maritalStatus: data.beneficiary.maritalStatus },
    });
    onContinue();
  };

  const priorMarriageDefault: PriorMarriage = {
    fullName: '',
    dateOfBirth: '',
    marriageDate: '',
    marriageCity: '',
    marriageCountry: '',
  };

  const emptyCurrentMarriage = {
    date: '' as const,
    city: '',
    country: '',
    spouseName: '',
    spouseDateOfBirth: '' as const,
  };

  const renderMaritalSection = (
    prefix: 'petitioner.maritalStatus' | 'beneficiary.maritalStatus',
    sectionLabel: string,
    timesMarried: number | undefined,
    priorFields: { id: string }[],
    appendPrior: (v: PriorMarriage) => void,
    removePrior: (i: number) => void,
    lastPriorRef: React.RefObject<HTMLDivElement | null>
  ) => {
    const tm = timesMarried === undefined || timesMarried === null ? 0 : Number(timesMarried);
    const sectionErrors = prefix === 'petitioner.maritalStatus'
      ? formState.errors.petitioner?.maritalStatus
      : formState.errors.beneficiary?.maritalStatus;

    return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label>How many times married? {REQUIRED_ASTERISK}</Label>
          <Controller
            name={`${prefix}.timesMarried` as FieldPath<Step3MaritalStatusData>}
            control={control}
            render={({ field }) => {
              const num = typeof field.value === 'number' && !Number.isNaN(field.value) ? field.value : 0;
              return (
                <Input
                  type="number"
                  min={0}
                  max={20}
                  className={INPUT_CLASS}
                  value={num}
                  onChange={(e) => {
                    const raw = e.target.valueAsNumber;
                    const newVal = Number.isNaN(raw) ? 0 : raw;
                    field.onChange(newVal);

                    // ── Clear hidden fields when timesMarried decreases ──
                    if (newVal === 0) {
                      // 0 marriages → clear BOTH currentMarriage and priorMarriages
                      setValue(`${prefix}.currentMarriage` as 'petitioner.maritalStatus.currentMarriage' | 'beneficiary.maritalStatus.currentMarriage', emptyCurrentMarriage);
                      setValue(`${prefix}.priorMarriages` as 'petitioner.maritalStatus.priorMarriages' | 'beneficiary.maritalStatus.priorMarriages', []);
                    } else if (newVal <= 1) {
                      // 1 marriage → clear priorMarriages (only current marriage matters)
                      setValue(`${prefix}.priorMarriages` as 'petitioner.maritalStatus.priorMarriages' | 'beneficiary.maritalStatus.priorMarriages', []);
                    }
                  }}
                />
              );
            }}
          />
          {sectionErrors?.timesMarried && (
            <p className="text-sm text-red-600">
              {sectionErrors.timesMarried.message as React.ReactNode}
            </p>
          )}
        </div>
      </div>

      {/* ── Current Marriage: visible only when timesMarried >= 1 ── */}
      {tm >= 1 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Current Marriage</h5>
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="space-y-2.5" data-field-id={`${prefix}.currentMarriage.date`}>
              <Label>Date of Marriage {REQUIRED_ASTERISK}</Label>
              <Controller
                name={`${prefix}.currentMarriage.date` as FieldPath<Step3MaritalStatusData>}
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="MM/DD/YYYY"
                    className={INPUT_CLASS}
                    value={String(field.value ?? '')}
                    onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                  />
                )}
              />
              {sectionErrors?.currentMarriage?.date && (
                <p className="text-sm text-red-600">{(sectionErrors.currentMarriage.date as { message?: string }).message}</p>
              )}
            </div>
            <div className="space-y-2.5" data-field-id={`${prefix}.currentMarriage.spouseName`}>
              <Label>Name of Current Spouse {REQUIRED_ASTERISK}</Label>
              <Input className={INPUT_CLASS} {...register(`${prefix}.currentMarriage.spouseName`)} />
              {sectionErrors?.currentMarriage?.spouseName && (
                <p className="text-sm text-red-600">{(sectionErrors.currentMarriage.spouseName as { message?: string }).message}</p>
              )}
            </div>
            <div className="space-y-2.5" data-field-id={`${prefix}.currentMarriage.city`}>
              <Label>City of Marriage {REQUIRED_ASTERISK}</Label>
              <Input className={INPUT_CLASS} {...register(`${prefix}.currentMarriage.city`)} />
              {sectionErrors?.currentMarriage?.city && (
                <p className="text-sm text-red-600">{(sectionErrors.currentMarriage.city as { message?: string }).message}</p>
              )}
            </div>
            <div className="space-y-2.5" data-field-id={`${prefix}.currentMarriage.country`}>
              <Label>Country of Marriage {REQUIRED_ASTERISK}</Label>
              <Input className={INPUT_CLASS} {...register(`${prefix}.currentMarriage.country`)} />
              {sectionErrors?.currentMarriage?.country && (
                <p className="text-sm text-red-600">{(sectionErrors.currentMarriage.country as { message?: string }).message}</p>
              )}
            </div>
            <div className="space-y-2.5" data-field-id={`${prefix}.currentMarriage.spouseDateOfBirth`}>
              <Label>Spouse Date of Birth</Label>
              <Controller
                name={`${prefix}.currentMarriage.spouseDateOfBirth` as FieldPath<Step3MaritalStatusData>}
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="MM/DD/YYYY"
                    className={INPUT_CLASS}
                    value={String(field.value ?? '')}
                    onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                  />
                )}
              />
              {sectionErrors?.currentMarriage?.spouseDateOfBirth && (
                <p className="text-sm text-red-600">{(sectionErrors.currentMarriage.spouseDateOfBirth as { message?: string }).message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Prior Marriages: visible ONLY when timesMarried > 1 ── */}
      {tm > 1 && (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Prior Marriages ({sectionLabel})</h5>
          <p className="text-sm text-gray-600">
            You indicated {tm} total marriages. Please add details for your {tm - 1} prior marriage{tm - 1 > 1 ? 's' : ''}.
          </p>
          {(sectionErrors?.priorMarriages as { message?: string })?.message && (
            <p className="text-sm text-red-600">{(sectionErrors?.priorMarriages as { message?: string }).message}</p>
          )}
          {priorFields.map((field, index) => {
            const priorErr = Array.isArray(sectionErrors?.priorMarriages) ? sectionErrors.priorMarriages[index] : undefined;
            return (
            <div
              key={field.id}
              ref={index === priorFields.length - 1 ? lastPriorRef : undefined}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Prior Marriage {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removePrior(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.fullName`}>
                  <Label>Full Name {REQUIRED_ASTERISK}</Label>
                  <Input className={INPUT_CLASS} {...register(`${prefix}.priorMarriages.${index}.fullName`)} />
                  {priorErr?.fullName && <p className="text-sm text-red-600">{(priorErr.fullName as { message?: string }).message}</p>}
                </div>
                <div className="space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.dateOfBirth`}>
                  <Label>Date of Birth {REQUIRED_ASTERISK}</Label>
                  <Controller
                    name={`${prefix}.priorMarriages.${index}.dateOfBirth` as FieldPath<Step3MaritalStatusData>}
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="MM/DD/YYYY"
                        className={INPUT_CLASS}
                        value={String(field.value ?? '')}
                        onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                      />
                    )}
                  />
                  {priorErr?.dateOfBirth && <p className="text-sm text-red-600">{(priorErr.dateOfBirth as { message?: string }).message}</p>}
                </div>
                <div className="space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.marriageDate`}>
                  <Label>Marriage Date {REQUIRED_ASTERISK}</Label>
                  <Controller
                    name={`${prefix}.priorMarriages.${index}.marriageDate` as FieldPath<Step3MaritalStatusData>}
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="MM/DD/YYYY"
                        className={INPUT_CLASS}
                        value={String(field.value ?? '')}
                        onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                      />
                    )}
                  />
                  {priorErr?.marriageDate && <p className="text-sm text-red-600">{(priorErr.marriageDate as { message?: string }).message}</p>}
                </div>
                <div className="space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.marriageCity`}>
                  <Label>Marriage City {REQUIRED_ASTERISK}</Label>
                  <Input className={INPUT_CLASS} {...register(`${prefix}.priorMarriages.${index}.marriageCity`)} />
                  {priorErr?.marriageCity && <p className="text-sm text-red-600">{(priorErr.marriageCity as { message?: string }).message}</p>}
                </div>
                <div className="space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.marriageCountry`}>
                  <Label>Marriage Country {REQUIRED_ASTERISK}</Label>
                  <Input className={INPUT_CLASS} {...register(`${prefix}.priorMarriages.${index}.marriageCountry`)} />
                  {priorErr?.marriageCountry && <p className="text-sm text-red-600">{(priorErr.marriageCountry as { message?: string }).message}</p>}
                </div>
                <div className="space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.divorceDate`}>
                  <Label>Divorce Date {REQUIRED_ASTERISK}</Label>
                  <Controller
                    name={`${prefix}.priorMarriages.${index}.divorceDate` as FieldPath<Step3MaritalStatusData>}
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="MM/DD/YYYY"
                        className={INPUT_CLASS}
                        value={String(field.value ?? '')}
                        onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                      />
                    )}
                  />
                  {priorErr?.divorceDate && <p className="text-sm text-red-600">{(priorErr.divorceDate as { message?: string }).message}</p>}
                </div>
                <div className="space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.divorceCity`}>
                  <Label>Divorce City {REQUIRED_ASTERISK}</Label>
                  <Input className={INPUT_CLASS} {...register(`${prefix}.priorMarriages.${index}.divorceCity`)} />
                  {priorErr?.divorceCity && <p className="text-sm text-red-600">{(priorErr.divorceCity as { message?: string }).message}</p>}
                </div>
                <div className="space-y-2.5" data-field-id={`${prefix}.priorMarriages.${index}.divorceCountry`}>
                  <Label>Divorce Country {REQUIRED_ASTERISK}</Label>
                  <Input className={INPUT_CLASS} {...register(`${prefix}.priorMarriages.${index}.divorceCountry`)} />
                  {priorErr?.divorceCountry && <p className="text-sm text-red-600">{(priorErr.divorceCountry as { message?: string }).message}</p>}
                </div>
              </div>
            </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed border-2 border-gray-300 py-6 text-gray-600 hover:border-[#b72b2b] hover:text-[#b72b2b] hover:bg-red-50/30"
            onClick={() => {
              appendPrior(priorMarriageDefault);
              setTimeout(() => lastPriorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
            }}
          >
            <PlusIcon className="size-4 mr-2" />
            Add Prior Marriage ({sectionLabel})
          </Button>
        </div>
      )}
    </div>
    );
  };

  // Collect specific error messages from maritalStatus errors for the summary banner
  const FIELD_LABELS: Record<string, string> = {
    'currentMarriage.date': 'Date of Marriage',
    'currentMarriage.city': 'City of Marriage',
    'currentMarriage.country': 'Country of Marriage',
    'currentMarriage.spouseName': 'Name of Current Spouse',
    'currentMarriage.spouseDateOfBirth': 'Spouse Date of Birth',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collectMaritalErrors = (errObj: any, personName: string): string[] => {
    const msgs: string[] = [];
    if (!errObj) return msgs;

    // timesMarried
    if (errObj.timesMarried?.message) msgs.push(`${personName}: ${errObj.timesMarried.message}`);

    // currentMarriage fields
    const cm = errObj.currentMarriage;
    if (cm) {
      for (const [key, label] of Object.entries(FIELD_LABELS)) {
        const field = key.startsWith('currentMarriage.') ? key.replace('currentMarriage.', '') : null;
        if (field && cm[field]?.message) {
          msgs.push(`${personName}: ${label} — ${cm[field].message}`);
        }
      }
    }

    // priorMarriages
    if (errObj.priorMarriages) {
      if (errObj.priorMarriages.message) {
        msgs.push(`${personName}: ${errObj.priorMarriages.message}`);
      }
      if (Array.isArray(errObj.priorMarriages)) {
        errObj.priorMarriages.forEach((pm: Record<string, { message?: string }> | undefined, i: number) => {
          if (!pm) return;
          for (const [, err] of Object.entries(pm)) {
            if (err?.message) msgs.push(`${personName}: Prior Marriage ${i + 1} — ${err.message}`);
          }
        });
      }
    }

    // Fallback if no specific messages found
    if (msgs.length === 0) msgs.push(`${personName}: marital status`);
    return msgs;
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnterSubmit} className="space-y-8">
      {Object.keys(formState.errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {formState.errors.petitioner?.maritalStatus && (
              <>
                {collectMaritalErrors(formState.errors.petitioner.maritalStatus, petitionerName).map((msg, i) => (
                  <li key={`p-${i}`}>{msg}</li>
                ))}
              </>
            )}
            {formState.errors.beneficiary?.maritalStatus && (
              <>
                {collectMaritalErrors(formState.errors.beneficiary.maritalStatus, beneficiaryName).map((msg, i) => (
                  <li key={`b-${i}`}>{msg}</li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          {petitionerName} — Marital Status
        </h3>
        {renderMaritalSection(
          'petitioner.maritalStatus',
          petitionerName,
          petitionerTimesMarried,
          petitionerPrev.fields,
          (v) => petitionerPrev.append(v),
          petitionerPrev.remove,
          lastPetitionerPrevRef
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          {beneficiaryName} — Marital Status
        </h3>

        {/* Phase 2.6: Spouse-is-petitioner shortcut (only for spouse cases). */}
        {isSpouseCase && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-3">
            <Label className="text-sm font-medium text-gray-800">
              Is your current spouse <span className="text-[#b72b2b] font-semibold">{petitionerFirstName}</span>?
            </Label>
            <RadioGroup
              value={(() => {
                const val = watch('beneficiary.maritalStatus.currentMarriage.spouseIsPetitioner' as FieldPath<Step3MaritalStatusData>);
                return val === true ? 'yes' : val === false ? 'no' : '';
              })()}
              onValueChange={(v) => {
                const isYes = v === 'yes';
                setValue('beneficiary.maritalStatus.currentMarriage.spouseIsPetitioner' as FieldPath<Step3MaritalStatusData>, isYes as never);
                if (isYes) {
                  // Auto-copy the petitioner's marriage data into the beneficiary's,
                  // and set timesMarried = 1 so the currentMarriage fields unlock & validate.
                  const pm = step3Data.petitioner.maritalStatus.currentMarriage;
                  setValue('beneficiary.maritalStatus.timesMarried', 1);
                  setValue('beneficiary.maritalStatus.currentMarriage.date' as FieldPath<Step3MaritalStatusData>, (pm?.date ?? '') as never);
                  setValue('beneficiary.maritalStatus.currentMarriage.city' as FieldPath<Step3MaritalStatusData>, (pm?.city ?? '') as never);
                  setValue('beneficiary.maritalStatus.currentMarriage.country' as FieldPath<Step3MaritalStatusData>, (pm?.country ?? '') as never);
                  setValue('beneficiary.maritalStatus.currentMarriage.spouseName' as FieldPath<Step3MaritalStatusData>, (step3Data.petitioner ? petitionerName : '') as never);
                }
              }}
              className="flex gap-6"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="yes" id="ben-spouse-is-pet-yes" />
                <span>Yes — fields below will be auto-filled from your data</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="no" id="ben-spouse-is-pet-no" />
                <span>No — spouse is a different person</span>
              </label>
            </RadioGroup>
            <p className="text-xs text-gray-500 italic">
              If Yes, we&rsquo;ll reuse your marriage info. You can still review and edit the fields below.
            </p>
          </div>
        )}

        {renderMaritalSection(
          'beneficiary.maritalStatus',
          beneficiaryName,
          beneficiaryTimesMarried,
          beneficiaryPrev.fields,
          (v) => beneficiaryPrev.append(v),
          beneficiaryPrev.remove,
          lastBeneficiaryPrevRef
        )}
      </section>

      {(formState.errors.petitioner?.maritalStatus as { message?: string })?.message && (
        <p className="text-sm text-red-600">
          {(formState.errors.petitioner?.maritalStatus as { message?: string }).message}
        </p>
      )}
      {(formState.errors.beneficiary?.maritalStatus as { message?: string })?.message && (
        <p className="text-sm text-red-600">
          {(formState.errors.beneficiary?.maritalStatus as { message?: string }).message}
        </p>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="bg-[#b72b2b] hover:bg-[#9a2424] text-white">
          Continue
        </Button>
      </div>
    </form>
  );
}

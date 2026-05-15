import { useForm, useFieldArray, Controller, type FieldPath, type UseFieldArrayReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { step5EmploymentHistorySchema, type Step5EmploymentHistoryData } from '@/lib/schemas';
import { useFormStore } from '@/lib/store/formStore';
import { useDynamicLabels } from '@/lib/useDynamicLabels';
import { formatDateInput, cn } from '@/lib/utils';
import { useScrollToFirstError } from '@/lib/useScrollToFirstError';
import { preventEnterSubmit } from '@/lib/formKeyGuard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusIcon, Trash2Icon } from 'lucide-react';

interface Step5EmploymentHistoryProps {
  onBack: () => void;
  onContinue: () => void;
}

const REQUIRED_ASTERISK = <span className="text-red-500 ml-1.5">*</span>;
const INPUT_CLASS =
  'bg-white border-gray-300 py-2.5 px-3 min-h-[42px] rounded-md';

export function Step5EmploymentHistory({ onBack, onContinue }: Step5EmploymentHistoryProps) {
  const { step5Data, setStep5Data } = useFormStore();
  const { petitionerName, beneficiaryName } = useDynamicLabels();

  const form = useForm<Step5EmploymentHistoryData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step5EmploymentHistorySchema) as any,
    defaultValues: {
      petitioner: {
        employments: step5Data.petitioner.employments.length > 0
          ? step5Data.petitioner.employments
          : [],
        currentEmploymentStatus: step5Data.petitioner.currentEmploymentStatus,
        petitionerSalary: step5Data.petitioner.petitionerSalary ?? '',
      },
      beneficiary: {
        employments: step5Data.beneficiary.employments.length > 0
          ? step5Data.beneficiary.employments
          : [],
        currentEmploymentStatus: step5Data.beneficiary.currentEmploymentStatus,
        intendedJobFieldInUS: step5Data.beneficiary.intendedJobFieldInUS ?? '',
        attendedUniversityOrHighSchool: (step5Data.beneficiary.attendedUniversityOrHighSchool ?? null) as unknown as boolean,
        numberOfInstitutions: step5Data.beneficiary.numberOfInstitutions ?? 0,
        institutions: step5Data.beneficiary.institutions?.length > 0
          ? step5Data.beneficiary.institutions
          : [],
        beneficiarySalary: step5Data.beneficiary.beneficiarySalary ?? '',
      },
    },
  });

  const { watch, control, register, formState, setValue } = form;
  const petitionerEmployments = useFieldArray({
    control,
    name: 'petitioner.employments',
  });
  const beneficiaryEmployments = useFieldArray({
    control,
    name: 'beneficiary.employments',
  });
  const beneficiaryInstitutions = useFieldArray({
    control,
    name: 'beneficiary.institutions',
  });

  useScrollToFirstError(form);
  const attendedUniversityOrHighSchool = watch('beneficiary.attendedUniversityOrHighSchool') === true;

  useEffect(() => {
    const subscription = watch((data) => {
      if (data?.petitioner && data?.beneficiary) {
        setStep5Data({
          petitioner: {
            employments: data.petitioner.employments,
            currentEmploymentStatus: data.petitioner.currentEmploymentStatus,
            petitionerSalary: data.petitioner.petitionerSalary ?? '',
          },
          beneficiary: {
            employments: data.beneficiary.employments,
            currentEmploymentStatus: data.beneficiary.currentEmploymentStatus,
            intendedJobFieldInUS: data.beneficiary.intendedJobFieldInUS ?? '',
            attendedUniversityOrHighSchool: (data.beneficiary.attendedUniversityOrHighSchool ?? null) as unknown as boolean,
            numberOfInstitutions: data.beneficiary.numberOfInstitutions ?? 0,
            institutions: data.beneficiary.institutions ?? [],
            beneficiarySalary: data.beneficiary.beneficiarySalary ?? '',
          },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStep5Data]);

  const onSubmit = (data: Step5EmploymentHistoryData) => {
    setStep5Data({
      petitioner: {
        employments: data.petitioner.employments,
        currentEmploymentStatus: data.petitioner.currentEmploymentStatus,
        petitionerSalary: data.petitioner.petitionerSalary ?? '',
      },
      beneficiary: {
        employments: data.beneficiary.employments,
        currentEmploymentStatus: data.beneficiary.currentEmploymentStatus,
        intendedJobFieldInUS: data.beneficiary.intendedJobFieldInUS ?? '',
        attendedUniversityOrHighSchool: (data.beneficiary.attendedUniversityOrHighSchool ?? null) as unknown as boolean,
        numberOfInstitutions: data.beneficiary.numberOfInstitutions ?? 0,
        institutions: data.beneficiary.institutions ?? [],
        beneficiarySalary: data.beneficiary.beneficiarySalary ?? '',
      },
    });
    onContinue();
  };

  const employmentStatusOptions = [
    { value: 'employed', label: 'Employed' },
    { value: 'student', label: 'Student' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'retired', label: 'Retired' },
  ] as const;

  const renderEmploymentCard = (
    fieldArray: UseFieldArrayReturn<Step5EmploymentHistoryData, 'petitioner.employments' | 'beneficiary.employments'>,
    prefix: 'petitioner.employments' | 'beneficiary.employments'
  ) => (
    <div className="space-y-4">
        {fieldArray.fields.map((field, index) => {
          const empErr = prefix === 'petitioner.employments' ? formState.errors.petitioner?.employments?.[index] : formState.errors.beneficiary?.employments?.[index];
          return (
          <div
            key={field.id}
            data-field-id={`${prefix}.${index}`}
            className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Employment {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => fieldArray.remove(index)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="space-y-2.5" data-field-id={`${prefix}.${index}.position`}>
                <Label>Position / Job Title {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, empErr?.position && 'border-red-500')}
                  {...register(`${prefix}.${index}.position`)}
                />
                {empErr?.position && <p className="text-red-500 text-sm mt-1">{(empErr.position as { message?: string }).message}</p>}
              </div>
              <div className="space-y-2.5" data-field-id={`${prefix}.${index}.employerName`}>
                <Label>Employer Name {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, empErr?.employerName && 'border-red-500')}
                  {...register(`${prefix}.${index}.employerName`)}
                />
                {empErr?.employerName && <p className="text-red-500 text-sm mt-1">{(empErr.employerName as { message?: string }).message}</p>}
              </div>
              <div className="sm:col-span-2 space-y-2.5" data-field-id={`${prefix}.${index}.employerAddress`}>
                <Label>Employer Address {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, empErr?.employerAddress && 'border-red-500')}
                  {...register(`${prefix}.${index}.employerAddress`)}
                />
                {empErr?.employerAddress && <p className="text-red-500 text-sm mt-1">{(empErr.employerAddress as { message?: string }).message}</p>}
              </div>
              <div className="space-y-2.5" data-field-id={`${prefix}.${index}.fromDate`}>
                <Label>From Date (MM/DD/YYYY) {REQUIRED_ASTERISK}</Label>
                <Controller
                  name={`${prefix}.${index}.fromDate` as FieldPath<Step5EmploymentHistoryData>}
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="MM/DD/YYYY"
                      className={cn(INPUT_CLASS, empErr?.fromDate && 'border-red-500')}
                      value={String(field.value ?? '')}
                      onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                    />
                  )}
                />
                {empErr?.fromDate && <p className="text-red-500 text-sm mt-1">{(empErr.fromDate as { message?: string }).message}</p>}
              </div>
              <div className="space-y-2.5" data-field-id={`${prefix}.${index}.toDate`}>
                <Label>To Date (MM/DD/YYYY) — leave empty if currently work there</Label>
                <Controller
                  name={`${prefix}.${index}.toDate` as FieldPath<Step5EmploymentHistoryData>}
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="MM/DD/YYYY — leave empty if currently work there"
                      className={cn(INPUT_CLASS, empErr?.toDate && 'border-red-500')}
                      value={String(field.value ?? '')}
                      onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                    />
                  )}
                />
                {empErr?.toDate && <p className="text-red-500 text-sm mt-1">{(empErr.toDate as { message?: string }).message}</p>}
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
          onClick={() =>
            fieldArray.append({
              position: '',
              employerName: '',
              employerAddress: '',
              fromDate: '',
              toDate: '',
            })
          }
        >
          <PlusIcon className="size-4 mr-2" />
          Add Employment History
        </Button>
      </div>
  );

  const renderBeneficiaryEmploymentSection = () => (
    <section className="space-y-4">
      <h4 className="text-base font-medium text-gray-800">Employment History ({beneficiaryName}) — Past 10 years</h4>
      <div className="space-y-4">
        <div className="space-y-2.5 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <Label>Current Employment Status</Label>
          <Controller
            name="beneficiary.currentEmploymentStatus"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ''}
                onValueChange={(v) => field.onChange(v || undefined)}
                className="flex flex-wrap gap-4"
              >
                {employmentStatusOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <RadioGroupItem value={opt.value} id={`beneficiary-status-${opt.value}`} />
                    <Label htmlFor={`beneficiary-status-${opt.value}`} className="font-normal cursor-pointer">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        </div>
        {renderEmploymentCard(beneficiaryEmployments, 'beneficiary.employments')}
        <div className="space-y-2.5 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <Label>In which job field do you intend to work in the U.S.?</Label>
          <Input
            className={INPUT_CLASS}
            placeholder="e.g. Software Engineering, Healthcare, Education..."
            {...register('beneficiary.intendedJobFieldInUS')}
          />
        </div>
      </div>
    </section>
  );

  const renderEducationSection = () => (
    <section className="space-y-4">
      <h4 className="text-base font-medium text-gray-800">Education ({beneficiaryName})</h4>
      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
        <div className="space-y-2.5" data-field-id="beneficiary.attendedUniversityOrHighSchool">
          <Label>Have you attended University or High School? {REQUIRED_ASTERISK}</Label>
          <Controller
            name="beneficiary.attendedUniversityOrHighSchool"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                onValueChange={(v) => {
                  const attended = v === 'yes';
                  field.onChange(attended);
                  if (!attended) {
                    // Clear hidden institution fields to prevent stale validation
                    setValue('beneficiary.institutions', []);
                    setValue('beneficiary.numberOfInstitutions', 0);
                  }
                }}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="edu-attended-yes" />
                  <Label htmlFor="edu-attended-yes" className="font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="edu-attended-no" />
                  <Label htmlFor="edu-attended-no" className="font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            )}
          />
          {(formState.errors.beneficiary as { attendedUniversityOrHighSchool?: { message?: string } })?.attendedUniversityOrHighSchool && (
            <p className="text-sm text-red-600">{(formState.errors.beneficiary as { attendedUniversityOrHighSchool?: { message?: string } }).attendedUniversityOrHighSchool!.message}</p>
          )}
        </div>
        {attendedUniversityOrHighSchool && (
          <>
            <div className="space-y-2.5">
              <Label>Number of universities/high schools attended:</Label>
              <Controller
                name="beneficiary.numberOfInstitutions"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    className={INPUT_CLASS}
                    value={field.value ?? 0}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      field.onChange(Number.isNaN(v) ? 0 : v);
                    }}
                  />
                )}
              />
            </div>
            <div className="space-y-4">
              {beneficiaryInstitutions.fields.map((field, index) => {
                const instErr = formState.errors.beneficiary?.institutions?.[index];
                return (
                <div
                  key={field.id}
                  data-field-id={`beneficiary.institutions.${index}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Name of Institution ({index + 1}):</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => beneficiaryInstitutions.remove(index)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2.5" data-field-id={`beneficiary.institutions.${index}.name`}>
                      <Label>Name of Institution {REQUIRED_ASTERISK}</Label>
                      <Input className={cn(INPUT_CLASS, instErr?.name && 'border-red-500')} {...register(`beneficiary.institutions.${index}.name`)} />
                      {instErr?.name && <p className="text-red-500 text-sm mt-1">{(instErr.name as { message?: string }).message}</p>}
                    </div>
                    <div className="sm:col-span-2 space-y-2.5" data-field-id={`beneficiary.institutions.${index}.address`}>
                      <Label>Full Address of Institution {REQUIRED_ASTERISK}</Label>
                      <Input className={cn(INPUT_CLASS, instErr?.address && 'border-red-500')} {...register(`beneficiary.institutions.${index}.address`)} />
                      {instErr?.address && <p className="text-red-500 text-sm mt-1">{(instErr.address as { message?: string }).message}</p>}
                    </div>
                    <div className="space-y-2.5">
                      <Label>Major Course of Study:</Label>
                      <Input className={INPUT_CLASS} {...register(`beneficiary.institutions.${index}.major`)} />
                    </div>
                    <div className="space-y-2.5">
                      <Label>Degree or Diploma:</Label>
                      <Input className={INPUT_CLASS} {...register(`beneficiary.institutions.${index}.degree`)} />
                    </div>
                    <div className="space-y-2.5" data-field-id={`beneficiary.institutions.${index}.fromDate`}>
                      <Label>Date of Attendance From (MM/DD/YYYY) {REQUIRED_ASTERISK}</Label>
                      <Controller
                        name={`beneficiary.institutions.${index}.fromDate` as FieldPath<Step5EmploymentHistoryData>}
                        control={control}
                        render={({ field: f }) => (
                          <Input
                            placeholder="MM/DD/YYYY"
                            className={cn(INPUT_CLASS, instErr?.fromDate && 'border-red-500')}
                            value={String(f.value ?? '')}
                            onChange={(e) => f.onChange(formatDateInput(e.target.value))}
                          />
                        )}
                      />
                      {instErr?.fromDate && <p className="text-red-500 text-sm mt-1">{(instErr.fromDate as { message?: string }).message}</p>}
                    </div>
                    <div className="space-y-2.5" data-field-id={`beneficiary.institutions.${index}.toDate`}>
                      <Label>Date of Attendance To (MM/DD/YYYY)</Label>
                      <Controller
                        name={`beneficiary.institutions.${index}.toDate` as FieldPath<Step5EmploymentHistoryData>}
                        control={control}
                        render={({ field: f }) => (
                          <Input
                            placeholder="MM/DD/YYYY"
                            className={cn(INPUT_CLASS, instErr?.toDate && 'border-red-500')}
                            value={String(f.value ?? '')}
                            onChange={(e) => f.onChange(formatDateInput(e.target.value))}
                          />
                        )}
                      />
                      {instErr?.toDate && <p className="text-red-500 text-sm mt-1">{(instErr.toDate as { message?: string }).message}</p>}
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
                onClick={() =>
                  beneficiaryInstitutions.append({
                    name: '',
                    address: '',
                    major: '',
                    degree: '',
                    fromDate: '',
                    toDate: '',
                  })
                }
              >
                <PlusIcon className="size-4 mr-2" />
                Add Institution
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );

  const allErrors = formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnterSubmit} className="space-y-8">
      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Employment History ({petitionerName}) — Last 5 years</h4>
        <div className="space-y-4">
          <div className="space-y-2.5 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <Label>Current Employment Status</Label>
            <Controller
              name="petitioner.currentEmploymentStatus"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value ?? ''}
                  onValueChange={(v) => field.onChange(v || undefined)}
                  className="flex flex-wrap gap-4"
                >
                  {employmentStatusOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <RadioGroupItem value={opt.value} id={`petitioner-status-${opt.value}`} />
                      <Label htmlFor={`petitioner-status-${opt.value}`} className="font-normal cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
          {renderEmploymentCard(petitionerEmployments, 'petitioner.employments')}
        </div>
      </section>
      {renderBeneficiaryEmploymentSection()}
      {renderEducationSection()}

      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Salary Information</h4>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="space-y-2.5 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <Label>{petitionerName} — Current Salary per Year ($)</Label>
            <Input
              type="text"
              inputMode="numeric"
              className={INPUT_CLASS}
              placeholder="e.g. 75000"
              {...register('petitioner.petitionerSalary')}
            />
          </div>
          <div className="space-y-2.5 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <Label>{beneficiaryName} — Current Salary per Year ($)</Label>
            <Input
              type="text"
              inputMode="numeric"
              className={INPUT_CLASS}
              placeholder="e.g. 50000"
              {...register('beneficiary.beneficiarySalary')}
            />
          </div>
        </div>
      </section>

      {Object.keys(allErrors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {allErrors.petitioner?.employments && (
              <li>{petitionerName}: Check all employment fields</li>
            )}
            {allErrors.beneficiary?.employments && (
              <li>{beneficiaryName}: Check all employment fields</li>
            )}
            {allErrors.beneficiary?.institutions && (
              <li>{beneficiaryName}: Check all education institution fields</li>
            )}
          </ul>
        </div>
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

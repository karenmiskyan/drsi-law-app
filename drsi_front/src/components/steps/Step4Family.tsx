import { useForm, useFieldArray, Controller, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { step4FamilySchema, type Step4FamilyData } from '@/lib/schemas';
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

interface Step4FamilyProps {
  onBack: () => void;
  onContinue: () => void;
}

const REQUIRED_ASTERISK = <span className="text-red-500 ml-1.5">*</span>;
const INPUT_CLASS =
  'bg-white border-gray-300 py-2.5 px-3 min-h-[42px] rounded-md';

export function Step4Family({ onBack, onContinue }: Step4FamilyProps) {
  const { step3Data, setStep3Data } = useFormStore();
  const { petitionerName, beneficiaryName } = useDynamicLabels();

  const form = useForm<Step4FamilyData>({
    resolver: zodResolver(step4FamilySchema),
    mode: 'onTouched',
    defaultValues: {
      petitioner: {
        father: step3Data.petitioner.father,
        mother: step3Data.petitioner.mother,
        numberOfDependentChildren: step3Data.petitioner.numberOfDependentChildren,
      },
      beneficiary: {
        father: step3Data.beneficiary.father,
        mother: step3Data.beneficiary.mother,
        childrenSameAsPetitioner: step3Data.beneficiary.childrenSameAsPetitioner ?? false,
        numberOfAllChildren: step3Data.beneficiary.numberOfAllChildren,
        children: step3Data.beneficiary.children,
      },
    },
  });

  useScrollToFirstError(form);

  const { watch, control, register, formState, setValue } = form;
  const beneficiaryChildren = useFieldArray({
    control,
    name: 'beneficiary.children',
  });

  const lastChildRef = useRef<HTMLDivElement | null>(null);

  const numberOfAllChildren = watch('beneficiary.numberOfAllChildren') ?? 0;

  useEffect(() => {
    const subscription = watch((data) => {
      if (data?.petitioner && data?.beneficiary) {
        setStep3Data({
          petitioner: {
            father: data.petitioner.father,
            mother: data.petitioner.mother,
            numberOfDependentChildren: data.petitioner.numberOfDependentChildren,
          },
          beneficiary: {
            father: data.beneficiary.father,
            mother: data.beneficiary.mother,
            childrenSameAsPetitioner: data.beneficiary.childrenSameAsPetitioner,
            numberOfAllChildren: data.beneficiary.numberOfAllChildren,
            children: data.beneficiary.children,
          },
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStep3Data]);

  const onSubmit = (data: Step4FamilyData) => {
    setStep3Data({
      petitioner: {
        father: data.petitioner.father,
        mother: data.petitioner.mother,
        numberOfDependentChildren: data.petitioner.numberOfDependentChildren,
      },
      beneficiary: {
        father: data.beneficiary.father,
        mother: data.beneficiary.mother,
        childrenSameAsPetitioner: data.beneficiary.childrenSameAsPetitioner,
        numberOfAllChildren: data.beneficiary.numberOfAllChildren,
        children: data.beneficiary.children,
      },
    });
    onContinue();
  };

  const getParentErr = (p: 'petitioner.father' | 'petitioner.mother' | 'beneficiary.father' | 'beneficiary.mother', field: string) => {
    const [section, who] = p.split('.') as [string, string];
    const errs = section === 'petitioner' ? formState.errors.petitioner?.[who as 'father'|'mother'] : formState.errors.beneficiary?.[who as 'father'|'mother'];
    const f = (errs as Record<string, { message?: string }>)?.[field];
    return f?.message;
  };

  const renderPetitionerParent = (
    prefix: 'petitioner.father' | 'petitioner.mother',
    title: string
  ) => {
    const isLiving = watch(`${prefix}.isLiving`);
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
        <h5 className="text-sm font-medium text-gray-700">{title}</h5>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="space-y-2.5" data-field-id={`${prefix}.surnames`}>
            <Label>Surnames {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'surnames') && 'border-red-500')} {...register(`${prefix}.surnames`)} />
            {getParentErr(prefix, 'surnames') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'surnames')}</p>}
          </div>
          <div className="space-y-2.5" data-field-id={`${prefix}.givenNames`}>
            <Label>Given Names {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'givenNames') && 'border-red-500')} {...register(`${prefix}.givenNames`)} />
            {getParentErr(prefix, 'givenNames') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'givenNames')}</p>}
          </div>
          <div className="space-y-2.5" data-field-id={`${prefix}.dateOfBirth`}>
            <Label>Date of Birth {REQUIRED_ASTERISK}</Label>
            <Controller
              name={`${prefix}.dateOfBirth` as FieldPath<Step4FamilyData>}
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="MM/DD/YYYY"
                  className={cn(INPUT_CLASS, getParentErr(prefix, 'dateOfBirth') && 'border-red-500')}
                  value={String(field.value ?? '')}
                  onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                />
              )}
            />
            {getParentErr(prefix, 'dateOfBirth') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'dateOfBirth')}</p>}
          </div>
          <div className="space-y-2.5" data-field-id={`${prefix}.cityOfBirth`}>
            <Label>City of Birth {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'cityOfBirth') && 'border-red-500')} {...register(`${prefix}.cityOfBirth`)} />
            {getParentErr(prefix, 'cityOfBirth') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'cityOfBirth')}</p>}
          </div>
          <div className="space-y-2.5" data-field-id={`${prefix}.countryOfBirth`}>
            <Label>Country of Birth {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'countryOfBirth') && 'border-red-500')} {...register(`${prefix}.countryOfBirth`)} />
            {getParentErr(prefix, 'countryOfBirth') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'countryOfBirth')}</p>}
          </div>
          <div className="sm:col-span-2 space-y-2.5" data-field-id={`${prefix}.isLiving`}>
            <Label>Is your {title.toLowerCase()} still living? {REQUIRED_ASTERISK}</Label>
            <Controller
              name={`${prefix}.isLiving` as FieldPath<Step4FamilyData>}
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                  onValueChange={(v) => {
                    const isLivingNow = v === 'yes';
                    field.onChange(isLivingNow);
                    if (!isLivingNow) {
                      // Clear hidden city/country fields when switching to "not living"
                      setValue(`${prefix}.currentCity` as FieldPath<Step4FamilyData>, '');
                      setValue(`${prefix}.currentCountry` as FieldPath<Step4FamilyData>, '');
                    }
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id={`${prefix}-living-yes`} />
                    <Label htmlFor={`${prefix}-living-yes`} className="font-normal cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id={`${prefix}-living-no`} />
                    <Label htmlFor={`${prefix}-living-no`} className="font-normal cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {getParentErr(prefix, 'isLiving') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'isLiving')}</p>}
          </div>
          {isLiving && (
            <>
              <div className="space-y-2.5" data-field-id={`${prefix}.currentCity`}>
                <Label>Current City {REQUIRED_ASTERISK}</Label>
                <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'currentCity') && 'border-red-500')} {...register(`${prefix}.currentCity`)} />
                {getParentErr(prefix, 'currentCity') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'currentCity')}</p>}
              </div>
              <div className="space-y-2.5" data-field-id={`${prefix}.currentCountry`}>
                <Label>Country of Residence {REQUIRED_ASTERISK}</Label>
                <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'currentCountry') && 'border-red-500')} {...register(`${prefix}.currentCountry`)} />
                {getParentErr(prefix, 'currentCountry') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'currentCountry')}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderBeneficiaryParent = (
    prefix: 'beneficiary.father' | 'beneficiary.mother',
    title: string,
    showSurnamesAtBirth: boolean
  ) => {
    const isLiving = watch(`${prefix}.isLiving`);
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
        <h5 className="text-sm font-medium text-gray-700">{title}</h5>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="space-y-2.5" data-field-id={`${prefix}.surnames`}>
            <Label>Surnames {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'surnames') && 'border-red-500')} {...register(`${prefix}.surnames`)} />
            {getParentErr(prefix, 'surnames') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'surnames')}</p>}
          </div>
          {showSurnamesAtBirth && (
            <div className="space-y-2.5">
              <Label>Mother&apos;s Surnames at Birth</Label>
              <Input className={INPUT_CLASS} {...register('beneficiary.mother.surnamesAtBirth')} />
            </div>
          )}
          <div className="space-y-2.5" data-field-id={`${prefix}.givenNames`}>
            <Label>Given Names {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'givenNames') && 'border-red-500')} {...register(`${prefix}.givenNames`)} />
            {getParentErr(prefix, 'givenNames') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'givenNames')}</p>}
          </div>
          <div className="space-y-2.5" data-field-id={`${prefix}.dateOfBirth`}>
            <Label>Date of Birth {REQUIRED_ASTERISK}</Label>
            <Controller
              name={`${prefix}.dateOfBirth` as FieldPath<Step4FamilyData>}
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="MM/DD/YYYY"
                  className={cn(INPUT_CLASS, getParentErr(prefix, 'dateOfBirth') && 'border-red-500')}
                  value={String(field.value ?? '')}
                  onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                />
              )}
            />
            {getParentErr(prefix, 'dateOfBirth') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'dateOfBirth')}</p>}
          </div>
          <div className="space-y-2.5" data-field-id={`${prefix}.cityOfBirth`}>
            <Label>City of Birth {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'cityOfBirth') && 'border-red-500')} {...register(`${prefix}.cityOfBirth`)} />
            {getParentErr(prefix, 'cityOfBirth') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'cityOfBirth')}</p>}
          </div>
          <div className="space-y-2.5" data-field-id={`${prefix}.countryOfBirth`}>
            <Label>Country of Birth {REQUIRED_ASTERISK}</Label>
            <Input className={cn(INPUT_CLASS, getParentErr(prefix, 'countryOfBirth') && 'border-red-500')} {...register(`${prefix}.countryOfBirth`)} />
            {getParentErr(prefix, 'countryOfBirth') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'countryOfBirth')}</p>}
          </div>
          <div className="sm:col-span-2 space-y-2.5" data-field-id={`${prefix}.isLiving`}>
            <Label>Is your {title.toLowerCase()} still living? {REQUIRED_ASTERISK}</Label>
            <Controller
              name={`${prefix}.isLiving` as FieldPath<Step4FamilyData>}
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                  onValueChange={(v) => {
                    const isLivingNow = v === 'yes';
                    field.onChange(isLivingNow);
                    if (isLivingNow) {
                      // Clear hidden yearOfDeath when switching to "living"
                      setValue(`${prefix}.yearOfDeath` as FieldPath<Step4FamilyData>, '');
                    } else {
                      // Clear hidden fullCurrentAddress when switching to "not living"
                      setValue(`${prefix}.fullCurrentAddress` as FieldPath<Step4FamilyData>, '');
                    }
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id={`${prefix}-living-yes`} />
                    <Label htmlFor={`${prefix}-living-yes`} className="font-normal cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id={`${prefix}-living-no`} />
                    <Label htmlFor={`${prefix}-living-no`} className="font-normal cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {getParentErr(prefix, 'isLiving') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'isLiving')}</p>}
          </div>
          {!isLiving && (
            <div className="sm:col-span-2 space-y-2.5" data-field-id={`${prefix}.yearOfDeath`}>
              <Label>Year of Death {REQUIRED_ASTERISK}</Label>
              <Input
                className={cn(INPUT_CLASS, getParentErr(prefix, 'yearOfDeath') && 'border-red-500')}
                placeholder="e.g. 1995"
                {...register(`${prefix}.yearOfDeath`)}
              />
              {getParentErr(prefix, 'yearOfDeath') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'yearOfDeath')}</p>}
            </div>
          )}
          {isLiving && (
            <div className="sm:col-span-2 space-y-2.5" data-field-id={`${prefix}.fullCurrentAddress`}>
              <Label>Full Current Address {REQUIRED_ASTERISK}</Label>
              <Input
                className={cn(INPUT_CLASS, 'min-h-[80px]', getParentErr(prefix, 'fullCurrentAddress') && 'border-red-500')}
                placeholder="Enter full address (street, city, state/province, country, postal code)"
                {...register(`${prefix}.fullCurrentAddress`)}
              />
              {getParentErr(prefix, 'fullCurrentAddress') && <p className="text-red-500 text-sm mt-1">{getParentErr(prefix, 'fullCurrentAddress')}</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const allErrors = formState.errors;
  const hasErrors = Object.keys(allErrors).length > 0;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnterSubmit} className="space-y-8">
      {hasErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {allErrors.petitioner?.father && (
              <li>{petitionerName}'s Father: {(allErrors.petitioner.father as { message?: string }).message ?? 'Check all required fields'}</li>
            )}
            {allErrors.petitioner?.mother && (
              <li>{petitionerName}'s Mother: {(allErrors.petitioner.mother as { message?: string }).message ?? 'Check all required fields'}</li>
            )}
            {allErrors.beneficiary?.father && (
              <li>{beneficiaryName}'s Father: {(allErrors.beneficiary.father as { message?: string }).message ?? 'Check all required fields'}</li>
            )}
            {allErrors.beneficiary?.mother && (
              <li>{beneficiaryName}'s Mother: {(allErrors.beneficiary.mother as { message?: string }).message ?? 'Check all required fields'}</li>
            )}
            {allErrors.beneficiary?.children && (
              <li>{(allErrors.beneficiary.children as { message?: string }).message ?? 'Add details for all children'}</li>
            )}
          </ul>
        </div>
      )}
      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Parents ({petitionerName})</h4>
        <div className="space-y-4">
          {renderPetitionerParent('petitioner.father', 'Father')}
          {renderPetitionerParent('petitioner.mother', 'Mother')}
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Parents ({beneficiaryName})</h4>
        <div className="space-y-4">
          {renderBeneficiaryParent('beneficiary.father', 'Father', false)}
          {renderBeneficiaryParent('beneficiary.mother', 'Mother', true)}
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Children</h4>
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <div className="flex items-center gap-2 space-y-0">
              <input
                type="checkbox"
                id="childrenSameAsPetitioner"
                className="h-4 w-4 rounded border-gray-300 text-[#b72b2b] focus:ring-[#b72b2b]"
                {...register('beneficiary.childrenSameAsPetitioner')}
              />
              <Label htmlFor="childrenSameAsPetitioner" className="font-normal cursor-pointer">
                The Children are the Same for {beneficiaryName} as {petitionerName}
              </Label>
            </div>
            <div className="space-y-2.5">
              <Label>Number of Dependent Children ({petitionerName}) {REQUIRED_ASTERISK}</Label>
              <Controller
                name="petitioner.numberOfDependentChildren"
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
            <div className="space-y-2.5">
              <Label>Number of All Children ({beneficiaryName}) {REQUIRED_ASTERISK}</Label>
              <Controller
                name="beneficiary.numberOfAllChildren"
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
          </div>

          {numberOfAllChildren > 0 && (
            <>
              <h5 className="text-sm font-medium text-gray-700">Children Details</h5>
              {beneficiaryChildren.fields.map((field, index) => {
                const childErr = (f: string) => (formState.errors.beneficiary?.children as Array<Record<string, { message?: string }>> | undefined)?.[index]?.[f]?.message;
                return (
                  <div
                    key={field.id}
                    ref={index === beneficiaryChildren.fields.length - 1 ? lastChildRef : undefined}
                    className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Child {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => beneficiaryChildren.remove(index)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-2 space-y-2.5" data-field-id={`beneficiary.children.${index}.nameSurname`}>
                        <Label>Child Names and Surname {REQUIRED_ASTERISK}</Label>
                        <Input className={cn(INPUT_CLASS, childErr('nameSurname') && 'border-red-500')} {...register(`beneficiary.children.${index}.nameSurname`)} />
                        {childErr('nameSurname') && <p className="text-red-500 text-sm mt-1">{childErr('nameSurname')}</p>}
                      </div>
                      <div className="space-y-2.5" data-field-id={`beneficiary.children.${index}.dateOfBirth`}>
                        <Label>Date of Birth (MM/DD/YYYY) {REQUIRED_ASTERISK}</Label>
                        <Controller
                          name={`beneficiary.children.${index}.dateOfBirth` as FieldPath<Step4FamilyData>}
                          control={control}
                          render={({ field: f }) => (
                            <Input
                              placeholder="MM/DD/YYYY"
                              className={cn(INPUT_CLASS, childErr('dateOfBirth') && 'border-red-500')}
                              value={String(f.value ?? '')}
                              onChange={(e) => f.onChange(formatDateInput(e.target.value))}
                            />
                          )}
                        />
                        {childErr('dateOfBirth') && <p className="text-red-500 text-sm mt-1">{childErr('dateOfBirth')}</p>}
                      </div>
                      <div className="space-y-2.5" data-field-id={`beneficiary.children.${index}.cityOfBirth`}>
                        <Label>City of Birth {REQUIRED_ASTERISK}</Label>
                        <Input className={cn(INPUT_CLASS, childErr('cityOfBirth') && 'border-red-500')} {...register(`beneficiary.children.${index}.cityOfBirth`)} />
                        {childErr('cityOfBirth') && <p className="text-red-500 text-sm mt-1">{childErr('cityOfBirth')}</p>}
                      </div>
                      <div className="space-y-2.5" data-field-id={`beneficiary.children.${index}.stateOrCountryOfBirth`}>
                        <Label>State/Country of Birth {REQUIRED_ASTERISK}</Label>
                        <Input className={cn(INPUT_CLASS, childErr('stateOrCountryOfBirth') && 'border-red-500')} {...register(`beneficiary.children.${index}.stateOrCountryOfBirth`)} />
                        {childErr('stateOrCountryOfBirth') && <p className="text-red-500 text-sm mt-1">{childErr('stateOrCountryOfBirth')}</p>}
                      </div>
                      <div className="sm:col-span-2 space-y-2.5" data-field-id={`beneficiary.children.${index}.livesWithYou`}>
                        <Label>Does this child live with you? {REQUIRED_ASTERISK}</Label>
                        <Controller
                          name={`beneficiary.children.${index}.livesWithYou` as FieldPath<Step4FamilyData>}
                          control={control}
                          render={({ field: f }) => (
                            <RadioGroup
                              value={f.value === true ? 'yes' : f.value === false ? 'no' : ''}
                              onValueChange={(v) => f.onChange(v === 'yes')}
                              className="flex gap-6"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="yes" id={`child-${index}-lives-yes`} />
                                <Label htmlFor={`child-${index}-lives-yes`} className="font-normal cursor-pointer">Yes</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="no" id={`child-${index}-lives-no`} />
                                <Label htmlFor={`child-${index}-lives-no`} className="font-normal cursor-pointer">No</Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                        {(formState.errors.beneficiary as { children?: Array<{ livesWithYou?: { message?: string } }> })?.children?.[index]?.livesWithYou && (
                          <p className="text-sm text-red-600">{(formState.errors.beneficiary as { children?: Array<{ livesWithYou?: { message?: string } }> }).children![index].livesWithYou!.message}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2 space-y-2.5" data-field-id={`beneficiary.children.${index}.immigratingWithYou`}>
                        <Label>Is this child immigrating to the U.S. with you? {REQUIRED_ASTERISK}</Label>
                        <Controller
                          name={`beneficiary.children.${index}.immigratingWithYou` as FieldPath<Step4FamilyData>}
                          control={control}
                          render={({ field: f }) => (
                            <RadioGroup
                              value={f.value === true ? 'yes' : f.value === false ? 'no' : ''}
                              onValueChange={(v) => f.onChange(v === 'yes')}
                              className="flex gap-6"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="yes" id={`child-${index}-imm-yes`} />
                                <Label htmlFor={`child-${index}-imm-yes`} className="font-normal cursor-pointer">Yes</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="no" id={`child-${index}-imm-no`} />
                                <Label htmlFor={`child-${index}-imm-no`} className="font-normal cursor-pointer">No</Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                        {(formState.errors.beneficiary as { children?: Array<{ immigratingWithYou?: { message?: string } }> })?.children?.[index]?.immigratingWithYou && (
                          <p className="text-sm text-red-600">{(formState.errors.beneficiary as { children?: Array<{ immigratingWithYou?: { message?: string } }> }).children![index].immigratingWithYou!.message}</p>
                        )}
                      </div>
                      {/* Is this child a US citizen? (gates the "US passport for child" document in Step 8) */}
                      <div className="sm:col-span-2 space-y-2.5" data-field-id={`beneficiary.children.${index}.isUSCitizen`}>
                        <Label>Is this child a U.S. citizen? {REQUIRED_ASTERISK}</Label>
                        <Controller
                          name={`beneficiary.children.${index}.isUSCitizen` as FieldPath<Step4FamilyData>}
                          control={control}
                          render={({ field: f }) => (
                            <RadioGroup
                              value={f.value === true ? 'yes' : f.value === false ? 'no' : ''}
                              onValueChange={(v) => f.onChange(v === 'yes')}
                              className="flex gap-6"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="yes" id={`child-${index}-uscitizen-yes`} />
                                <Label htmlFor={`child-${index}-uscitizen-yes`} className="font-normal cursor-pointer">Yes</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="no" id={`child-${index}-uscitizen-no`} />
                                <Label htmlFor={`child-${index}-uscitizen-no`} className="font-normal cursor-pointer">No</Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                        {(formState.errors.beneficiary as { children?: Array<{ isUSCitizen?: { message?: string } }> })?.children?.[index]?.isUSCitizen && (
                          <p className="text-sm text-red-600">{(formState.errors.beneficiary as { children?: Array<{ isUSCitizen?: { message?: string } }> }).children![index].isUSCitizen!.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed border-2 border-gray-300 py-6 text-gray-600 hover:border-[#b72b2b] hover:text-[#b72b2b] hover:bg-red-50/30"
              onClick={() => {
                beneficiaryChildren.append({
                  nameSurname: '',
                  dateOfBirth: '',
                  cityOfBirth: '',
                  stateOrCountryOfBirth: '',
                  // Leave radios unselected (Meir: "leave unmarked so the client can choose")
                  livesWithYou: null as unknown as boolean,
                  immigratingWithYou: null as unknown as boolean,
                  isUSCitizen: null as unknown as boolean,
                });
                setTimeout(() => lastChildRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
              }}
            >
              <PlusIcon className="size-4 mr-2" />
              Add Child
            </Button>
          </div>
        </div>
      </section>

      {(formState.errors.beneficiary?.children as { message?: string })?.message && (
        <p className="text-sm text-red-600">
          {(formState.errors.beneficiary?.children as { message?: string }).message}
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

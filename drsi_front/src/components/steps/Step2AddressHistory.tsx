import { useForm, useFieldArray, Controller, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { step2Schema, type Step2Data } from '@/lib/schemas';
import { useFormStore } from '@/lib/store/formStore';
import { useDynamicLabels } from '@/lib/useDynamicLabels';
import { formatDateInput, cn } from '@/lib/utils';
import { useScrollToFirstError } from '@/lib/useScrollToFirstError';
import { preventEnterSubmit } from '@/lib/formKeyGuard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/PhoneInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusIcon, Trash2Icon } from 'lucide-react';

interface Step2AddressHistoryProps {
  onBack: () => void;
  onContinue: () => void;
}

const REQUIRED_ASTERISK = <span className="text-red-500 ml-1.5">*</span>;
const INPUT_CLASS =
  'bg-white border-gray-300 py-2.5 px-3 min-h-[42px] rounded-md';


function AddressFields({
  prefix,
  register,
  control,
  errors,
  includeEndDate = false,
  endDateRequired = true,
}: {
  prefix: 'petitioner.currentAddress' | 'beneficiary.currentAddress' | `petitioner.previousAddresses.${number}` | `beneficiary.previousAddresses.${number}`;
  register: ReturnType<typeof useForm<Step2Data>>['register'];
  control: ReturnType<typeof useForm<Step2Data>>['control'];
  errors: Record<string, unknown>;
  includeEndDate?: boolean;
  endDateRequired?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-2.5" data-field-id={`${prefix}.street`}>
        <Label>Street {REQUIRED_ASTERISK}</Label>
        <Input
          className={cn(INPUT_CLASS, errors?.street ? 'border-red-500' : undefined)}
          placeholder="Street name and number"
          {...register(`${prefix}.street`)}
        />
        {errors?.street ? (
          <p className="text-red-500 text-sm mt-1">
            {((errors.street as { message?: string })?.message ?? 'Invalid') as React.ReactNode}
          </p>
        ) : null}
      </div>
      <div className="sm:col-span-2 space-y-2.5">
        <Label>Floor / Apt. / Suite</Label>
        <Input
          className={INPUT_CLASS}
          placeholder="Floor, apartment, or suite number"
          {...register(`${prefix}.floorAptSuite`)}
        />
      </div>
      <div className="space-y-2.5" data-field-id={`${prefix}.city`}>
        <Label>City {REQUIRED_ASTERISK}</Label>
        <Input className={cn(INPUT_CLASS, errors?.city ? 'border-red-500' : undefined)} {...register(`${prefix}.city`)} />
        {errors?.city ? (
          <p className="text-red-500 text-sm mt-1">
            {((errors.city as { message?: string })?.message ?? 'Invalid') as React.ReactNode}
          </p>
        ) : null}
      </div>
      <div className="space-y-2.5" data-field-id={`${prefix}.zip`}>
        <Label>ZIP / Postal Code {REQUIRED_ASTERISK}</Label>
        <Input className={cn(INPUT_CLASS, errors?.zip ? 'border-red-500' : undefined)} {...register(`${prefix}.zip`)} />
        {errors?.zip ? (
          <p className="text-red-500 text-sm mt-1">
            {((errors.zip as { message?: string })?.message ?? 'Invalid') as React.ReactNode}
          </p>
        ) : null}
      </div>
      <div className="space-y-2.5" data-field-id={`${prefix}.stateOrCountry`}>
        <Label>State / Country {REQUIRED_ASTERISK}</Label>
        <Input className={cn(INPUT_CLASS, errors?.stateOrCountry ? 'border-red-500' : undefined)} {...register(`${prefix}.stateOrCountry`)} />
        {errors?.stateOrCountry ? (
          <p className="text-red-500 text-sm mt-1">
            {((errors.stateOrCountry as { message?: string })?.message ?? 'Invalid') as React.ReactNode}
          </p>
        ) : null}
      </div>
      <div className="space-y-2.5" data-field-id={`${prefix}.startDate`}>
        <Label>Start Date {REQUIRED_ASTERISK}</Label>
        <Controller
          name={`${prefix}.startDate` as FieldPath<Step2Data>}
          control={control}
          render={({ field }) => (
            <Input
              placeholder="MM/DD/YYYY"
              className={cn(INPUT_CLASS, errors?.startDate ? 'border-red-500' : undefined)}
              value={String(field.value ?? '')}
              onChange={(e) =>
                field.onChange(formatDateInput(e.target.value))
              }
            />
          )}
        />
        {errors?.startDate ? (
          <p className="text-red-500 text-sm mt-1">
            {((errors.startDate as { message?: string })?.message ?? 'Invalid') as React.ReactNode}
          </p>
        ) : null}
      </div>
      {includeEndDate && (
        <div className="space-y-2.5" data-field-id={`${prefix}.endDate`}>
          <Label>End Date {endDateRequired ? REQUIRED_ASTERISK : null}</Label>
          <Controller
            name={`${prefix}.endDate` as FieldPath<Step2Data>}
            control={control}
            render={({ field }) => (
              <Input
                placeholder="MM/DD/YYYY"
                className={cn(INPUT_CLASS, errors?.endDate ? 'border-red-500' : undefined)}
                value={String(field.value ?? '')}
                onChange={(e) =>
                  field.onChange(formatDateInput(e.target.value))
                }
              />
            )}
          />
          {errors?.endDate ? (
            <p className="text-red-500 text-sm mt-1">
              {((errors.endDate as { message?: string })?.message ?? 'Invalid') as React.ReactNode}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function Step2AddressHistory({ onBack, onContinue }: Step2AddressHistoryProps) {
  const {
    petitionerAddress,
    beneficiaryAddress,
    futureUSAddress,
    setPetitionerAddress,
    setBeneficiaryAddress,
    setFutureUSAddress,
  } = useFormStore();
  const { petitionerName, beneficiaryName, petitionerFirstName, beneficiaryFirstName } = useDynamicLabels();

  const form = useForm<Step2Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {
      petitioner: {
        ...petitionerAddress,
        previousAddresses: petitionerAddress.previousAddresses.map((addr) => ({
          ...addr,
          endDate: (addr as { endDate?: string }).endDate ?? '',
        })),
      },
      beneficiary: {
        ...beneficiaryAddress,
        previousAddresses: beneficiaryAddress.previousAddresses.map((addr) => ({
          ...addr,
          endDate: (addr as { endDate?: string }).endDate ?? '',
        })),
      },
      futureUSAddress,
    },
  });

  useScrollToFirstError(form);

  const { watch, reset, control, register, formState, setValue } = form;
  const futureUSAddr = watch('futureUSAddress') ?? futureUSAddress;

  const petitionerPrev = useFieldArray({
    control,
    name: 'petitioner.previousAddresses',
  });

  const beneficiaryPrev = useFieldArray({
    control,
    name: 'beneficiary.previousAddresses',
  });

  const lastPetitionerRef = useRef<HTMLDivElement | null>(null);
  const lastBeneficiaryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    reset({
      petitioner: {
        ...petitionerAddress,
        previousAddresses: petitionerAddress.previousAddresses.map((addr) => ({
          ...addr,
          endDate: (addr as { endDate?: string }).endDate ?? '',
        })),
      },
      beneficiary: {
        ...beneficiaryAddress,
        previousAddresses: beneficiaryAddress.previousAddresses.map((addr) => ({
          ...addr,
          endDate: (addr as { endDate?: string }).endDate ?? '',
        })),
      },
      futureUSAddress,
    });
  }, []);

  useEffect(() => {
    const subscription = watch((data) => {
      if (data?.petitioner) setPetitionerAddress(data.petitioner);
      if (data?.beneficiary) setBeneficiaryAddress(data.beneficiary);
      if (data?.futureUSAddress)
        setFutureUSAddress(data.futureUSAddress);
    });
    return () => subscription.unsubscribe();
  }, [watch, setPetitionerAddress, setBeneficiaryAddress, setFutureUSAddress]);

  const isGreenCardHere = watch('futureUSAddress.isGreenCardDeliveryAddress');

  const onSubmit = (data: Step2Data) => {
    setPetitionerAddress(data.petitioner);
    setBeneficiaryAddress(data.beneficiary);
    setFutureUSAddress(data.futureUSAddress);
    onContinue();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnterSubmit} className="space-y-8">
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {form.formState.errors.petitioner && <li>{petitionerName}: Check address fields below</li>}
            {form.formState.errors.beneficiary && <li>{beneficiaryName}: Check address fields below</li>}
            {form.formState.errors.futureUSAddress && <li>Future US Address: Check highlighted fields below</li>}
          </ul>
        </div>
      )}

      {/* Petitioner Address — uses firstName per Meir's feedback */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          {petitionerFirstName} — Your Address History for the Last 5 Years
        </h3>

        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-800">
            Current Address
          </h4>
          {/* End Date removed from current address (Meir: "For current address, erase End Date"). */}
          <AddressFields
            prefix="petitioner.currentAddress"
            register={register}
            control={control}
            errors={formState.errors.petitioner?.currentAddress ?? {}}
            includeEndDate={false}
            endDateRequired={false}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-800">
            Previous Addresses (Last 5 Years)
          </h4>
          {petitionerPrev.fields.map((field, index) => (
            <div
              key={field.id}
              ref={index === petitionerPrev.fields.length - 1 ? lastPetitionerRef : undefined}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Previous Address {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => petitionerPrev.remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
              <AddressFields
                prefix={`petitioner.previousAddresses.${index}`}
                register={register}
                control={control}
                errors={
                  formState.errors.petitioner?.previousAddresses?.[index] ?? {}
                }
                includeEndDate
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed border-2 border-gray-300 py-6 text-gray-600 hover:border-[#b72b2b] hover:text-[#b72b2b] hover:bg-red-50/30"
            onClick={() => {
              petitionerPrev.append({
                street: '',
                floorAptSuite: '',
                city: '',
                zip: '',
                stateOrCountry: '',
                startDate: '',
                endDate: '',
              });
              setTimeout(() => {
                lastPetitionerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 50);
            }}
          >
            <PlusIcon className="size-4 mr-2" />
            Add Another Address
          </Button>
        </div>
      </section>

      {/* Beneficiary Address — uses firstName per Meir's feedback */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          {beneficiaryFirstName} — Your Address History Since Age 16
        </h3>

        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-800">
            Current Address
          </h4>
          {/* End Date removed from current address (Meir: "For current address, erase End Date"). */}
          <AddressFields
            prefix="beneficiary.currentAddress"
            register={register}
            control={control}
            errors={formState.errors.beneficiary?.currentAddress ?? {}}
            includeEndDate={false}
            endDateRequired={false}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-800">
            Previous Addresses (Since Age 16)
          </h4>
          {beneficiaryPrev.fields.map((field, index) => (
            <div
              key={field.id}
              ref={index === beneficiaryPrev.fields.length - 1 ? lastBeneficiaryRef : undefined}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Previous Address {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => beneficiaryPrev.remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
              <AddressFields
                prefix={`beneficiary.previousAddresses.${index}`}
                register={register}
                control={control}
                errors={
                  formState.errors.beneficiary?.previousAddresses?.[index] ??
                  {}
                }
                includeEndDate
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed border-2 border-gray-300 py-6 text-gray-600 hover:border-[#b72b2b] hover:text-[#b72b2b] hover:bg-red-50/30"
            onClick={() => {
              beneficiaryPrev.append({
                street: '',
                floorAptSuite: '',
                city: '',
                zip: '',
                stateOrCountry: '',
                startDate: '',
                endDate: '',
              });
              setTimeout(() => {
                lastBeneficiaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 50);
            }}
          >
            <PlusIcon className="size-4 mr-2" />
            Add Another Address
          </Button>
        </div>
      </section>

      {/* Future US Address */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Future US Address
        </h3>
        {/* Helper note per Meir's request */}
        <p className="text-sm text-gray-600 italic">
          If you do not have a U.S. address, you may provide the address of a family member or trusted friend.
        </p>

        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2.5" data-field-id="futureUSAddress.nameOfPersonLiving">
            <Label>Name of person currently living at address {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.nameOfPersonLiving && 'border-red-500')}
              {...register('futureUSAddress.nameOfPersonLiving')}
            />
            {formState.errors.futureUSAddress?.nameOfPersonLiving && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.futureUSAddress.nameOfPersonLiving.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2.5" data-field-id="futureUSAddress.address">
            <Label>Address {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.address && 'border-red-500')}
              {...register('futureUSAddress.address')}
            />
            {formState.errors.futureUSAddress?.address && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.futureUSAddress.address.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2.5">
            <Label>Floor / Apt. / Suite</Label>
            <Input
              className={INPUT_CLASS}
              placeholder="Floor, apartment, or suite number"
              {...register('futureUSAddress.floorAptSuite')}
            />
          </div>
          <div className="space-y-2.5" data-field-id="futureUSAddress.city">
            <Label>City {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.city && 'border-red-500')}
              {...register('futureUSAddress.city')}
            />
            {formState.errors.futureUSAddress?.city && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.futureUSAddress.city.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="futureUSAddress.state">
            <Label>State {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.state && 'border-red-500')}
              {...register('futureUSAddress.state')}
            />
            {formState.errors.futureUSAddress?.state && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.futureUSAddress.state.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="futureUSAddress.zipCode">
            <Label>ZIP Code {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.zipCode && 'border-red-500')}
              {...register('futureUSAddress.zipCode')}
            />
            {formState.errors.futureUSAddress?.zipCode && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.futureUSAddress.zipCode.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="futureUSAddress.phoneNumber">
            <Label>Phone Number {REQUIRED_ASTERISK}</Label>
            <div className={cn(formState.errors.futureUSAddress?.phoneNumber && 'rounded-md border-2 border-red-500 p-1')}>
              <PhoneInput
              countryCode={futureUSAddr.phoneCountryCode ?? '+1'}
              onCountryCodeChange={(v) => {
                setValue('futureUSAddress.phoneCountryCode', v);
                setFutureUSAddress({ phoneCountryCode: v });
              }}
              phoneNumber={futureUSAddr.phoneNumber ?? ''}
              onPhoneNumberChange={(v) => {
                setValue('futureUSAddress.phoneNumber', v);
                setFutureUSAddress({ phoneNumber: v });
              }}
            />
            </div>
            {formState.errors.futureUSAddress?.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.futureUSAddress.phoneNumber.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2.5">
            <Label>Is this the address to receive the Green Card? {REQUIRED_ASTERISK}</Label>
            <Controller
              name="futureUSAddress.isGreenCardDeliveryAddress"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value ? 'yes' : 'no'}
                  onValueChange={(v) => {
                    const isYes = v === 'yes';
                    field.onChange(isYes);
                    setValue('futureUSAddress.isGreenCardDeliveryAddress', isYes);
                    if (isYes) {
                      // Clear hidden contact fields to prevent stale validation
                      setValue('futureUSAddress.contactPerson', '');
                      setValue('futureUSAddress.contactStreet', '');
                      setValue('futureUSAddress.contactFloorAptSuite', '');
                      setValue('futureUSAddress.contactCity', '');
                      setValue('futureUSAddress.contactState', '');
                      setValue('futureUSAddress.contactZip', '');
                      setValue('futureUSAddress.contactPhoneCountryCode', '');
                      setValue('futureUSAddress.contactPhone', '');
                    }
                  }}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="yes" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="no" />
                    <span>No</span>
                  </label>
                </RadioGroup>
              )}
            />
          </div>

          {!isGreenCardHere && (
            <>
              <div className="sm:col-span-2 space-y-2.5" data-field-id="futureUSAddress.contactPerson">
                <Label>Contact Person {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.contactPerson && 'border-red-500')}
                  {...register('futureUSAddress.contactPerson')}
                />
                {formState.errors.futureUSAddress?.contactPerson && (
                  <p className="text-red-500 text-sm mt-1">
                    {formState.errors.futureUSAddress.contactPerson.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-2.5" data-field-id="futureUSAddress.contactStreet">
                <Label>Street Address {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.contactStreet && 'border-red-500')}
                  placeholder="Street name and number"
                  {...register('futureUSAddress.contactStreet')}
                />
                {formState.errors.futureUSAddress?.contactStreet && (
                  <p className="text-red-500 text-sm mt-1">
                    {formState.errors.futureUSAddress.contactStreet.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-2.5">
                <Label>Floor / Apt. / Suite</Label>
                <Input
                  className={INPUT_CLASS}
                  placeholder="Floor, apartment, or suite number"
                  {...register('futureUSAddress.contactFloorAptSuite')}
                />
              </div>
              <div className="space-y-2.5" data-field-id="futureUSAddress.contactCity">
                <Label>City {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.contactCity && 'border-red-500')}
                  {...register('futureUSAddress.contactCity')}
                />
                {formState.errors.futureUSAddress?.contactCity && (
                  <p className="text-red-500 text-sm mt-1">
                    {formState.errors.futureUSAddress.contactCity.message}
                  </p>
                )}
              </div>
              <div className="space-y-2.5" data-field-id="futureUSAddress.contactState">
                <Label>State {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.contactState && 'border-red-500')}
                  {...register('futureUSAddress.contactState')}
                />
                {formState.errors.futureUSAddress?.contactState && (
                  <p className="text-red-500 text-sm mt-1">
                    {formState.errors.futureUSAddress.contactState.message}
                  </p>
                )}
              </div>
              <div className="space-y-2.5" data-field-id="futureUSAddress.contactZip">
                <Label>ZIP Code {REQUIRED_ASTERISK}</Label>
                <Input
                  className={cn(INPUT_CLASS, formState.errors.futureUSAddress?.contactZip && 'border-red-500')}
                  {...register('futureUSAddress.contactZip')}
                />
                {formState.errors.futureUSAddress?.contactZip && (
                  <p className="text-red-500 text-sm mt-1">
                    {formState.errors.futureUSAddress.contactZip.message}
                  </p>
                )}
              </div>
              <div className="space-y-2.5" data-field-id="futureUSAddress.contactPhone">
                <Label>Phone Number {REQUIRED_ASTERISK}</Label>
                <div className={cn(formState.errors.futureUSAddress?.contactPhone && 'rounded-md border-2 border-red-500 p-1')}>
                  <PhoneInput
                    countryCode={futureUSAddr.contactPhoneCountryCode ?? '+1'}
                    onCountryCodeChange={(v) => {
                      setValue('futureUSAddress.contactPhoneCountryCode', v);
                      setFutureUSAddress({ contactPhoneCountryCode: v });
                    }}
                    phoneNumber={futureUSAddr.contactPhone ?? ''}
                    onPhoneNumberChange={(v) => {
                      setValue('futureUSAddress.contactPhone', v);
                      setFutureUSAddress({ contactPhone: v });
                    }}
                  />
                </div>
                {formState.errors.futureUSAddress?.contactPhone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formState.errors.futureUSAddress.contactPhone.message}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Petitioner lived-elsewhere section removed per Meir's feedback —
          only relevant for the foreign beneficiary, not the US-based petitioner. */}

      {/* Lived Elsewhere — Beneficiary (required, red asterisk) */}
      <section className="space-y-4" data-field-id="beneficiary.livedInOtherCountryOver6Months">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Have you ever lived in any other country for more than 6 months? {REQUIRED_ASTERISK}
        </h3>
        <p className="text-sm text-gray-600">({beneficiaryFirstName})</p>
        <Controller
          name="beneficiary.livedInOtherCountryOver6Months"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
              onValueChange={(v) => {
                const isYes = v === 'yes';
                field.onChange(isYes);
                if (!isYes) {
                  // Clear hidden lived-elsewhere entries to prevent stale validation
                  setValue('beneficiary.livedInOtherCountryDetails', []);
                }
              }}
              className="flex gap-6"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="yes" />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="no" />
                <span>No</span>
              </label>
            </RadioGroup>
          )}
        />
        {watch('beneficiary.livedInOtherCountryOver6Months') === true && (
          <div className="space-y-4 mt-4">
            {(
              (form.getValues('beneficiary.livedInOtherCountryDetails') ?? []) as Array<{ country: string; duration: string }>
            ).map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label>Country {REQUIRED_ASTERISK}</Label>
                  <Input
                    className={INPUT_CLASS}
                    {...register(`beneficiary.livedInOtherCountryDetails.${index}.country`)}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label>How long? {REQUIRED_ASTERISK}</Label>
                  <Input
                    className={INPUT_CLASS}
                    placeholder="e.g. 2 years, 8 months"
                    {...register(`beneficiary.livedInOtherCountryDetails.${index}.duration`)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      const curr = form.getValues('beneficiary.livedInOtherCountryDetails') ?? [];
                      form.setValue(
                        'beneficiary.livedInOtherCountryDetails',
                        curr.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const curr = form.getValues('beneficiary.livedInOtherCountryDetails') ?? [];
                form.setValue('beneficiary.livedInOtherCountryDetails', [...curr, { country: '', duration: '' }]);
              }}
            >
              <PlusIcon className="size-4 mr-2" />
              Add country
            </Button>
          </div>
        )}
      </section>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-gray-300"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="bg-[#b72b2b] hover:bg-[#9a2424] text-white px-8"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}

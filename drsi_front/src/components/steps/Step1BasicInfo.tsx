import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { step1Schema, type Step1Data, type BasicPerson } from '@/lib/schemas';
import { useFormStore } from '@/lib/store/formStore';
import { useDynamicLabels } from '@/lib/useDynamicLabels';
import { composeFullName } from '@/lib/nameHelpers';
import { COUNTRIES } from '@/lib/countries';
import { ComboboxSelect } from '@/components/ui/ComboboxSelect';
import { formatDateInput, cn } from '@/lib/utils';
import { useScrollToFirstError } from '@/lib/useScrollToFirstError';
import { preventEnterSubmit } from '@/lib/formKeyGuard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/PhoneInput';
import { PlusIcon, Trash2Icon } from 'lucide-react';

interface Step1BasicInfoProps {
  onBack?: () => void;
  onContinue: () => void;
}

const REQUIRED_ASTERISK = <span className="text-red-500 ml-1.5">*</span>;
const INPUT_CLASS =
  'bg-white border-gray-300 py-2.5 px-3 min-h-[42px] rounded-md';

export function Step1BasicInfo({ onBack, onContinue }: Step1BasicInfoProps) {
  const { petitioner, beneficiary, setPetitioner, setBeneficiary, caseType } =
    useFormStore();
  const { petitionerName, beneficiaryName } = useDynamicLabels();

  // Fields pre-filled by Step 0 are read-only
  // Name parts are pre-filled from Step 0. We check firstName OR legacy fullName
  // so records migrated from before the split still show read-only.
  const petitionerNamePreFilled = !!(petitioner.firstName?.trim() || petitioner.fullName?.trim());
  const beneficiaryNamePreFilled = !!(beneficiary.firstName?.trim() || beneficiary.fullName?.trim());
  const relationshipFromCaseType = caseType
    ? caseType === 'spouse' ? 'Spouse' : caseType === 'child' ? 'Unmarried Child' : 'Parent'
    : '';
  const relationshipPreFilled = !!relationshipFromCaseType;

  const form = useForm<Step1Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step1Schema) as any,
    mode: 'onChange',
    defaultValues: {
      petitioner,
      beneficiary,
    },
  });

  useScrollToFirstError(form);

  const { watch, reset, control, register } = form;
  const petitionerAdditionalPhones = useFieldArray({
    control,
    name: 'petitioner.additionalPhones',
  });
  const petitionerAdditionalEmails = useFieldArray({
    control,
    name: 'petitioner.additionalEmails' as 'petitioner.additionalPhones',
  });
  const beneficiaryAdditionalPhones = useFieldArray({
    control,
    name: 'beneficiary.additionalPhones',
  });
  const beneficiaryAdditionalEmails = useFieldArray({
    control,
    name: 'beneficiary.additionalEmails' as 'beneficiary.additionalPhones',
  });

  useEffect(() => {
    reset({ petitioner, beneficiary });
  }, []);

  useEffect(() => {
    const subscription = watch((data) => {
      if (data?.petitioner) {
        const p = data.petitioner;
        setPetitioner({
          ...(p as BasicPerson),
          // Keep legacy fullName in sync for Filament / PDF / admin display
          fullName: composeFullName({ firstName: p.firstName, middleName: p.middleName, surname: p.surname }),
        });
      }
      if (data?.beneficiary) {
        const b = data.beneficiary;
        setBeneficiary({
          ...(b as BasicPerson),
          fullName: composeFullName({ firstName: b.firstName, middleName: b.middleName, surname: b.surname }),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setPetitioner, setBeneficiary]);

  const onSubmit = (data: Step1Data) => {
    setPetitioner({
      ...(data.petitioner as BasicPerson),
      fullName: composeFullName(data.petitioner),
    });
    setBeneficiary({
      ...(data.beneficiary as BasicPerson),
      fullName: composeFullName(data.beneficiary),
    });
    onContinue();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnterSubmit} className="space-y-8">
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {form.formState.errors.petitioner && <li>{petitionerName}: Check highlighted fields below</li>}
            {form.formState.errors.beneficiary && <li>{beneficiaryName}: Check highlighted fields below</li>}
          </ul>
        </div>
      )}

      {/* Petitioner Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Information About You ({petitionerName})
        </h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {/* Name is split (first/middle/surname), read-only when pre-filled from Step 0. */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
            <div data-field-id="petitioner.firstName">
              <Label>First Name {REQUIRED_ASTERISK}</Label>
              <Input
                className={cn(INPUT_CLASS, petitionerNamePreFilled && 'bg-gray-50 text-gray-700', form.formState.errors.petitioner?.firstName && 'border-red-500')}
                readOnly={petitionerNamePreFilled}
                tabIndex={petitionerNamePreFilled ? -1 : undefined}
                {...form.register('petitioner.firstName')}
              />
              {form.formState.errors.petitioner?.firstName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.petitioner.firstName.message}</p>
              )}
            </div>
            <div data-field-id="petitioner.middleName">
              <Label>Middle Name</Label>
              <Input
                className={cn(INPUT_CLASS, petitionerNamePreFilled && 'bg-gray-50 text-gray-700')}
                readOnly={petitionerNamePreFilled}
                tabIndex={petitionerNamePreFilled ? -1 : undefined}
                {...form.register('petitioner.middleName')}
              />
            </div>
            <div data-field-id="petitioner.surname">
              <Label>Last Name {REQUIRED_ASTERISK}</Label>
              <Input
                className={cn(INPUT_CLASS, petitionerNamePreFilled && 'bg-gray-50 text-gray-700', form.formState.errors.petitioner?.surname && 'border-red-500')}
                readOnly={petitionerNamePreFilled}
                tabIndex={petitionerNamePreFilled ? -1 : undefined}
                {...form.register('petitioner.surname')}
              />
              {form.formState.errors.petitioner?.surname && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.petitioner.surname.message}</p>
              )}
            </div>
            {petitionerNamePreFilled && (
              <p className="text-xs text-gray-400 sm:col-span-3">Entered in the intro step. Go back to Step 0 to change.</p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.relationship">
            <Label>Relationship {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, relationshipPreFilled && 'bg-gray-50 text-gray-700', form.formState.errors.petitioner?.relationship && 'border-red-500')}
              placeholder="e.g. Spouse, Parent, Sibling"
              readOnly={relationshipPreFilled}
              tabIndex={relationshipPreFilled ? -1 : undefined}
              value={relationshipPreFilled ? relationshipFromCaseType : undefined}
              {...(relationshipPreFilled ? {} : form.register('petitioner.relationship'))}
              {...(relationshipPreFilled ? { onChange: undefined } : {})}
            />
            {relationshipPreFilled && (
              <p className="text-xs text-gray-400 mt-1">Determined by case type selection.</p>
            )}
            {form.formState.errors.petitioner?.relationship && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.petitioner.relationship.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.phoneNumber">
            <Label>Phone Number {REQUIRED_ASTERISK}</Label>
            <div className={cn(form.formState.errors.petitioner?.phoneNumber && 'rounded-md border-2 border-red-500 p-0.5')}>
              <Controller
                name="petitioner.phoneCountryCode"
                control={form.control}
                render={({ field: ccField }) => (
                  <Controller
                    name="petitioner.phoneNumber"
                    control={form.control}
                    render={({ field: phoneField }) => (
                      <PhoneInput
                        countryCode={ccField.value ?? '+1'}
                        onCountryCodeChange={ccField.onChange}
                        phoneNumber={phoneField.value ?? ''}
                        onPhoneNumberChange={phoneField.onChange}
                      />
                    )}
                  />
                )}
              />
            </div>
            {form.formState.errors.petitioner?.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.petitioner.phoneNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.email">
            <Label>Email {REQUIRED_ASTERISK}</Label>
            <Input
              type="email"
              className={cn(INPUT_CLASS, form.formState.errors.petitioner?.email && 'border-red-500')}
              {...form.register('petitioner.email')}
            />
            {form.formState.errors.petitioner?.email && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.petitioner.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.dateOfBirth">
            <Label>Date of Birth {REQUIRED_ASTERISK}</Label>
            <Controller
              name="petitioner.dateOfBirth"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="MM/DD/YYYY"
                  className={cn(INPUT_CLASS, form.formState.errors.petitioner?.dateOfBirth && 'border-red-500')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                />
              )}
            />
            {form.formState.errors.petitioner?.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.petitioner.dateOfBirth.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.cityOfBirth">
            <Label>City of Birth {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, form.formState.errors.petitioner?.cityOfBirth && 'border-red-500')}
              {...form.register('petitioner.cityOfBirth')}
            />
            {form.formState.errors.petitioner?.cityOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.petitioner.cityOfBirth.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.countryOfBirth">
            <Label>Country of Birth {REQUIRED_ASTERISK}</Label>
            <ComboboxSelect
              options={COUNTRIES}
              listId="countries-petitioner-cob"
              className={INPUT_CLASS}
              error={!!form.formState.errors.petitioner?.countryOfBirth}
              {...form.register('petitioner.countryOfBirth')}
            />
            {form.formState.errors.petitioner?.countryOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.petitioner.countryOfBirth.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.socialSecurityNumber">
            <Label>Social Security Number</Label>
            <Input
              className={cn(INPUT_CLASS, form.formState.errors.petitioner?.socialSecurityNumber && 'border-red-500')}
              inputMode="numeric"
              maxLength={9}
              placeholder="9 digits"
              {...form.register('petitioner.socialSecurityNumber', {
                onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9); },
              })}
            />
            {form.formState.errors.petitioner?.socialSecurityNumber && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.petitioner.socialSecurityNumber.message}</p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="petitioner.aNumber">
            <Label>A-Number</Label>
            <Input
              className={cn(INPUT_CLASS, form.formState.errors.petitioner?.aNumber && 'border-red-500')}
              inputMode="numeric"
              maxLength={9}
              placeholder="9 digits (Alien Registration Number)"
              {...form.register('petitioner.aNumber', {
                onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9); },
              })}
            />
            {form.formState.errors.petitioner?.aNumber && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.petitioner.aNumber.message}</p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2" data-field-id="petitioner.additionalPhones">
            <Label>Additional Phone Numbers</Label>
            {petitionerAdditionalPhones.fields.map((field, index) => {
              const rowError = form.formState.errors.petitioner?.additionalPhones?.[index];
              return (
              <div key={field.id} className="flex gap-2 items-start" data-field-id={`petitioner.additionalPhones.${index}.number`}>
                <div className={cn('flex-1', rowError && 'rounded-md border-2 border-red-500 p-1')}>
                  <Controller
                    name={`petitioner.additionalPhones.${index}.countryCode`}
                    control={control}
                    render={({ field: ccField }) => (
                      <Controller
                        name={`petitioner.additionalPhones.${index}.number`}
                        control={control}
                        render={({ field: phoneField }) => (
                          <PhoneInput
                            countryCode={ccField.value ?? '+1'}
                            onCountryCodeChange={ccField.onChange}
                            phoneNumber={phoneField.value ?? ''}
                            onPhoneNumberChange={phoneField.onChange}
                          />
                        )}
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => petitionerAdditionalPhones.remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => petitionerAdditionalPhones.append({ countryCode: '+1', number: '' })}
            >
              <PlusIcon className="size-4 mr-1" />
              Add Phone
            </Button>
          </div>
          <div className="sm:col-span-2 space-y-2" data-field-id="petitioner.additionalEmails">
            <Label>Additional Email Addresses</Label>
            {petitionerAdditionalEmails.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start" data-field-id={`petitioner.additionalEmails.${index}`}>
                <Input
                  type="email"
                  className={cn(INPUT_CLASS, (form.formState.errors.petitioner?.additionalEmails as { message?: string }[])?.[index] && 'border-red-500')}
                  placeholder="Email"
                  {...register(`petitioner.additionalEmails.${index}`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => petitionerAdditionalEmails.remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
              const current = form.getValues('petitioner.additionalEmails') ?? [];
              form.setValue('petitioner.additionalEmails', [...current, '']);
            }}
            >
              <PlusIcon className="size-4 mr-1" />
              Add Email
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficiary Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Your Applicant Family Member ({beneficiaryName})
        </h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {/* Beneficiary name is split; read-only when pre-filled from Step 0. */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
            <div data-field-id="beneficiary.firstName">
              <Label>First Name {REQUIRED_ASTERISK}</Label>
              <Input
                className={cn(INPUT_CLASS, beneficiaryNamePreFilled && 'bg-gray-50 text-gray-700', form.formState.errors.beneficiary?.firstName && 'border-red-500')}
                readOnly={beneficiaryNamePreFilled}
                tabIndex={beneficiaryNamePreFilled ? -1 : undefined}
                {...form.register('beneficiary.firstName')}
              />
              {form.formState.errors.beneficiary?.firstName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.beneficiary.firstName.message}</p>
              )}
            </div>
            <div data-field-id="beneficiary.middleName">
              <Label>Middle Name</Label>
              <Input
                className={cn(INPUT_CLASS, beneficiaryNamePreFilled && 'bg-gray-50 text-gray-700')}
                readOnly={beneficiaryNamePreFilled}
                tabIndex={beneficiaryNamePreFilled ? -1 : undefined}
                {...form.register('beneficiary.middleName')}
              />
            </div>
            <div data-field-id="beneficiary.surname">
              <Label>Last Name {REQUIRED_ASTERISK}</Label>
              <Input
                className={cn(INPUT_CLASS, beneficiaryNamePreFilled && 'bg-gray-50 text-gray-700', form.formState.errors.beneficiary?.surname && 'border-red-500')}
                readOnly={beneficiaryNamePreFilled}
                tabIndex={beneficiaryNamePreFilled ? -1 : undefined}
                {...form.register('beneficiary.surname')}
              />
              {form.formState.errors.beneficiary?.surname && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.beneficiary.surname.message}</p>
              )}
            </div>
            {beneficiaryNamePreFilled && (
              <p className="text-xs text-gray-400 sm:col-span-3">Entered in the intro step. Go back to Step 0 to change.</p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.relationship">
            <Label>Relationship {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, relationshipPreFilled && 'bg-gray-50 text-gray-700', form.formState.errors.beneficiary?.relationship && 'border-red-500')}
              placeholder="e.g. Spouse, Child, Parent"
              readOnly={relationshipPreFilled}
              tabIndex={relationshipPreFilled ? -1 : undefined}
              value={relationshipPreFilled ? relationshipFromCaseType : undefined}
              {...(relationshipPreFilled ? {} : form.register('beneficiary.relationship'))}
              {...(relationshipPreFilled ? { onChange: undefined } : {})}
            />
            {relationshipPreFilled && (
              <p className="text-xs text-gray-400 mt-1">Determined by case type selection.</p>
            )}
            {form.formState.errors.beneficiary?.relationship && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.beneficiary.relationship.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.phoneNumber">
            <Label>Phone Number {REQUIRED_ASTERISK}</Label>
            <div className={cn(form.formState.errors.beneficiary?.phoneNumber && 'rounded-md border-2 border-red-500 p-0.5')}>
              <Controller
                name="beneficiary.phoneCountryCode"
                control={form.control}
                render={({ field: ccField }) => (
                  <Controller
                    name="beneficiary.phoneNumber"
                    control={form.control}
                    render={({ field: phoneField }) => (
                      <PhoneInput
                        countryCode={ccField.value ?? '+1'}
                        onCountryCodeChange={ccField.onChange}
                        phoneNumber={phoneField.value ?? ''}
                        onPhoneNumberChange={phoneField.onChange}
                      />
                    )}
                  />
                )}
              />
            </div>
            {form.formState.errors.beneficiary?.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.beneficiary.phoneNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.email">
            <Label>Email {REQUIRED_ASTERISK}</Label>
            <Input
              type="email"
              className={cn(INPUT_CLASS, form.formState.errors.beneficiary?.email && 'border-red-500')}
              {...form.register('beneficiary.email')}
            />
            {form.formState.errors.beneficiary?.email && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.beneficiary.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.dateOfBirth">
            <Label>Date of Birth {REQUIRED_ASTERISK}</Label>
            <Controller
              name="beneficiary.dateOfBirth"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="MM/DD/YYYY"
                  className={cn(INPUT_CLASS, form.formState.errors.beneficiary?.dateOfBirth && 'border-red-500')}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(formatDateInput(e.target.value))}
                />
              )}
            />
            {form.formState.errors.beneficiary?.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.beneficiary.dateOfBirth.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.cityOfBirth">
            <Label>City of Birth {REQUIRED_ASTERISK}</Label>
            <Input
              className={cn(INPUT_CLASS, form.formState.errors.beneficiary?.cityOfBirth && 'border-red-500')}
              {...form.register('beneficiary.cityOfBirth')}
            />
            {form.formState.errors.beneficiary?.cityOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.beneficiary.cityOfBirth.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.countryOfBirth">
            <Label>Country of Birth {REQUIRED_ASTERISK}</Label>
            <ComboboxSelect
              options={COUNTRIES}
              listId="countries-beneficiary-cob"
              className={INPUT_CLASS}
              error={!!form.formState.errors.beneficiary?.countryOfBirth}
              {...form.register('beneficiary.countryOfBirth')}
            />
            {form.formState.errors.beneficiary?.countryOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.beneficiary.countryOfBirth.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.socialSecurityNumber">
            <Label>Social Security Number</Label>
            <Input
              className={cn(INPUT_CLASS, form.formState.errors.beneficiary?.socialSecurityNumber && 'border-red-500')}
              inputMode="numeric"
              maxLength={9}
              placeholder="9 digits"
              {...form.register('beneficiary.socialSecurityNumber', {
                onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9); },
              })}
            />
            {form.formState.errors.beneficiary?.socialSecurityNumber && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.beneficiary.socialSecurityNumber.message}</p>
            )}
          </div>
          <div className="space-y-2.5" data-field-id="beneficiary.aNumber">
            <Label>A-Number</Label>
            <Input
              className={cn(INPUT_CLASS, form.formState.errors.beneficiary?.aNumber && 'border-red-500')}
              inputMode="numeric"
              maxLength={9}
              placeholder="9 digits (Alien Registration Number)"
              {...form.register('beneficiary.aNumber', {
                onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9); },
              })}
            />
            {form.formState.errors.beneficiary?.aNumber && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.beneficiary.aNumber.message}</p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Additional Phone Numbers</Label>
            {beneficiaryAdditionalPhones.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Controller
                    name={`beneficiary.additionalPhones.${index}.countryCode`}
                    control={control}
                    render={({ field: ccField }) => (
                      <Controller
                        name={`beneficiary.additionalPhones.${index}.number`}
                        control={control}
                        render={({ field: phoneField }) => (
                          <PhoneInput
                            countryCode={ccField.value ?? '+1'}
                            onCountryCodeChange={ccField.onChange}
                            phoneNumber={phoneField.value ?? ''}
                            onPhoneNumberChange={phoneField.onChange}
                          />
                        )}
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => beneficiaryAdditionalPhones.remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => beneficiaryAdditionalPhones.append({ countryCode: '+1', number: '' })}
            >
              <PlusIcon className="size-4 mr-1" />
              Add Phone
            </Button>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Additional Email Addresses</Label>
            {beneficiaryAdditionalEmails.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  type="email"
                  className={INPUT_CLASS}
                  placeholder="Email"
                  {...register(`beneficiary.additionalEmails.${index}`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => beneficiaryAdditionalEmails.remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = form.getValues('beneficiary.additionalEmails') ?? [];
                form.setValue('beneficiary.additionalEmails', [...current, '']);
              }}
            >
              <PlusIcon className="size-4 mr-1" />
              Add Email
            </Button>
          </div>
        </div>
      </section>

      <div className="flex justify-between pt-4">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
        ) : <div />}
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

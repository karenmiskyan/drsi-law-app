import { useForm, useFieldArray, Controller, type FieldPath, type UseFieldArrayReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { step6OtherInfoSchema, type Step6OtherInfoData } from '@/lib/schemas';
import { useFormStore } from '@/lib/store/formStore';
import { useDynamicLabels } from '@/lib/useDynamicLabels';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { formatDateInput, cn } from '@/lib/utils';
import { useScrollToFirstError } from '@/lib/useScrollToFirstError';
import { preventEnterSubmit } from '@/lib/formKeyGuard';

interface Step6OtherInformationProps {
  onBack: () => void;
  onContinue: () => void;
}

const REQUIRED_ASTERISK = <span className="text-red-500 ml-1.5">*</span>;
const INPUT_CLASS =
  'bg-white border-gray-300 py-2.5 px-3 min-h-[42px] rounded-md';

export function Step6OtherInformation({ onBack, onContinue }: Step6OtherInformationProps) {
  const { step6Data, setStep6Data } = useFormStore();
  const { petitionerName, beneficiaryName } = useDynamicLabels();

  const form = useForm<Step6OtherInfoData>({
    resolver: zodResolver(step6OtherInfoSchema),
    defaultValues: {
      petitioner: {
        nationalities: step6Data.petitioner.nationalities?.length
          ? step6Data.petitioner.nationalities
          : [{ nationality: '', passportNumber: '' }],
        eyeColor: step6Data.petitioner.eyeColor ?? '',
        hairColor: step6Data.petitioner.hairColor ?? '',
        heightFeet: step6Data.petitioner.heightFeet ?? '',
        weightPounds: step6Data.petitioner.weightPounds ?? '',
        appliedForGreenCardBefore: step6Data.petitioner.appliedForGreenCardBefore ?? '',
        howBecameUSCitizen: step6Data.petitioner.howBecameUSCitizen ?? '',
      },
      beneficiary: {
        nationalities: step6Data.beneficiary.nationalities?.length
          ? step6Data.beneficiary.nationalities
          : [{ nationality: '', passportNumber: '' }],
        eyeColor: step6Data.beneficiary.eyeColor ?? '',
        hairColor: step6Data.beneficiary.hairColor ?? '',
        heightFeet: step6Data.beneficiary.heightFeet ?? '',
        weightPounds: step6Data.beneficiary.weightPounds ?? '',
        appliedForGreenCardBefore: step6Data.beneficiary.appliedForGreenCardBefore ?? '',
        militaryBranch: step6Data.beneficiary.militaryBranch ?? '',
        militaryDates: step6Data.beneficiary.militaryDates ?? '',
        militaryRank: step6Data.beneficiary.militaryRank ?? '',
        militaryPosition: step6Data.beneficiary.militaryPosition ?? '',
        militaryCountry: step6Data.beneficiary.militaryCountry ?? '',
        traveledToCountriesLast5Years: step6Data.beneficiary.traveledToCountriesLast5Years ?? '',
        usVisaDateIssued: step6Data.beneficiary.usVisaDateIssued ?? '',
        usVisaClassification: step6Data.beneficiary.usVisaClassification ?? '',
        usVisaNumber: step6Data.beneficiary.usVisaNumber ?? '',
        usVisaLostStolenExplain: step6Data.beneficiary.usVisaLostStolenExplain ?? '',
        usVisaCanceledRevokedExplain: step6Data.beneficiary.usVisaCanceledRevokedExplain ?? '',
        last5USVisits: (() => {
          const v = step6Data.beneficiary.last5USVisits;
          if (!Array.isArray(v) || v.length === 0) return [];
          return v.map((x) => ({
            dateArrived: x?.dateArrived ?? '',
            lengthOfStay: x?.lengthOfStay ?? '',
          }));
        })(),
        belongedToOrganizations: step6Data.beneficiary.belongedToOrganizations,
        specializedSkills: step6Data.beneficiary.specializedSkills,
        paramilitaryInvolvement: step6Data.beneficiary.paramilitaryInvolvement,
        speakOtherLanguages: step6Data.beneficiary.speakOtherLanguages,
        languagesSpoken: step6Data.beneficiary.languagesSpoken ?? '',
        organizationsSkills: step6Data.beneficiary.organizationsSkills ?? '',
        wantSSAIssueSSN: step6Data.beneficiary.wantSSAIssueSSN ?? false,
        authorizeDisclosureDHS: step6Data.beneficiary.authorizeDisclosureDHS ?? false,
        socialMediaFacebook: step6Data.beneficiary.socialMediaFacebook ?? '',
        socialMediaInstagram: step6Data.beneficiary.socialMediaInstagram ?? '',
        socialMediaLinkedIn: step6Data.beneficiary.socialMediaLinkedIn ?? '',
        socialMediaTwitter: step6Data.beneficiary.socialMediaTwitter ?? '',
      },
    },
  });

  const { watch, control, register, formState, setValue } = form;
  const petitionerNationalities = useFieldArray({
    control,
    name: 'petitioner.nationalities',
  });
  const beneficiaryNationalities = useFieldArray({
    control,
    name: 'beneficiary.nationalities',
  });
  const last5USVisits = useFieldArray({
    control,
    name: 'beneficiary.last5USVisits',
  });

  useScrollToFirstError(form);

  // On mount: ensure nationalities always has at least one row when empty (prevents "Add at least one" error)
  useEffect(() => {
    const values = form.getValues();
    const pet = values.petitioner?.nationalities ?? [];
    const ben = values.beneficiary?.nationalities ?? [];
    const needsPet = !Array.isArray(pet) || pet.length === 0;
    const needsBen = !Array.isArray(ben) || ben.length === 0;
    if (needsPet || needsBen) {
      form.reset({
        ...values,
        petitioner: {
          ...values.petitioner,
          nationalities: needsPet ? [{ nationality: '', passportNumber: '' }] : pet,
        },
        beneficiary: {
          ...values.beneficiary,
          nationalities: needsBen ? [{ nationality: '', passportNumber: '' }] : ben,
        },
      });
    }
  }, [form]);

  // When user removes the last row, auto-add one so they always have at least one nationality
  useEffect(() => {
    if (petitionerNationalities.fields.length === 0) {
      petitionerNationalities.append({ nationality: '', passportNumber: '' });
    }
  }, [petitionerNationalities.fields.length]);
  useEffect(() => {
    if (beneficiaryNationalities.fields.length === 0) {
      beneficiaryNationalities.append({ nationality: '', passportNumber: '' });
    }
  }, [beneficiaryNationalities.fields.length]);

  useEffect(() => {
    const subscription = watch((data) => {
      if (data?.petitioner && data?.beneficiary) {
        setStep6Data({
          petitioner: data.petitioner,
          beneficiary: data.beneficiary,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStep6Data]);

  const onSubmit = (data: Step6OtherInfoData) => {
    setStep6Data({ petitioner: data.petitioner, beneficiary: data.beneficiary });
    onContinue();
  };

  const renderNationalitiesSection = (
    title: string,
    fieldArray: UseFieldArrayReturn<Step6OtherInfoData, 'petitioner.nationalities' | 'beneficiary.nationalities'>,
    prefix: 'petitioner.nationalities' | 'beneficiary.nationalities'
  ) => (
    <div className="space-y-4" data-field-id={prefix}>
      <h5 className="text-sm font-medium text-gray-700">{title}</h5>
      {fieldArray.fields.map((field, index) => {
        const natErrs = prefix === 'petitioner.nationalities'
          ? formState.errors.petitioner?.nationalities
          : formState.errors.beneficiary?.nationalities;
        const natErr = Array.isArray(natErrs) ? natErrs[index] : undefined;
        return (
        <div
          key={field.id}
          data-field-id={`${prefix}.${index}`}
          className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 flex gap-4 items-end"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2" data-field-id={`${prefix}.${index}.nationality`}>
              <Label>Nationality {REQUIRED_ASTERISK}</Label>
              <Input
                className={cn(INPUT_CLASS, natErr?.nationality && 'border-red-500')}
                {...register(`${prefix}.${index}.nationality`)}
              />
              {natErr?.nationality && (
                <p className="text-red-500 text-sm mt-1">{(natErr.nationality as { message?: string }).message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Passport Number</Label>
              <Input className={INPUT_CLASS} {...register(`${prefix}.${index}.passportNumber`)} />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => fieldArray.remove(index)}
            disabled={fieldArray.fields.length <= 1}
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
        className="border-dashed border-2 border-gray-300"
        onClick={(e) => {
          e.preventDefault();
          fieldArray.append({ nationality: '', passportNumber: '' });
        }}
      >
        <PlusIcon className="size-4 mr-2" />
        Add Nationality / Passport
      </Button>
    </div>
  );

  const renderDescribeYourself = (prefix: 'petitioner' | 'beneficiary') => (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Eye Color</Label>
        <Input className={INPUT_CLASS} {...register(`${prefix}.eyeColor`)} />
      </div>
      <div className="space-y-2">
        <Label>Hair Color</Label>
        <Input className={INPUT_CLASS} {...register(`${prefix}.hairColor`)} />
      </div>
      <div className="space-y-2">
        <Label>Height (feet)</Label>
        <Input className={INPUT_CLASS} type="text" placeholder="e.g. 5.10" {...register(`${prefix}.heightFeet`)} />
      </div>
      <div className="space-y-2">
        <Label>Weight (pounds)</Label>
        <Input className={INPUT_CLASS} type="text" placeholder="e.g. 150" {...register(`${prefix}.weightPounds`)} />
      </div>
    </div>
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnterSubmit} className="space-y-8">
      {/* General - Petitioner */}
      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Other Information - {petitionerName}</h4>
        <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          {renderNationalitiesSection(
            'Nationalities and Citizenships from other Countries',
            petitionerNationalities,
            'petitioner.nationalities'
          )}
          <div className="space-y-2">
            <Label>Describe Yourself</Label>
            {renderDescribeYourself('petitioner')}
          </div>
          <div className="space-y-2">
            <Label>If you are a US citizen, how did you become a US citizen?</Label>
            <Controller
              name="petitioner.howBecameUSCitizen"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger className={INPUT_CLASS + ' w-full'}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birth_in_us">Birth inside US</SelectItem>
                    <SelectItem value="birth_abroad">Birth to US Parents abroad</SelectItem>
                    <SelectItem value="naturalization">Naturalization</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </section>

      {/* General - Beneficiary */}
      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Other Information ({beneficiaryName})</h4>
        <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          {renderNationalitiesSection(
            'Current and Past Nationalities + Passport Numbers',
            beneficiaryNationalities,
            'beneficiary.nationalities'
          )}
          <div className="space-y-2">
            <Label>Describe Yourself</Label>
            {renderDescribeYourself('beneficiary')}
          </div>
        </div>
      </section>

      {/* Beneficiary Only - Military, Travel, US Visas, etc. */}
      <section className="space-y-4">
        <h4 className="text-base font-medium text-gray-800">Military, Travel & Additional ({beneficiaryName})</h4>
        <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Military Service: Branch</Label>
              <Input className={INPUT_CLASS} {...register('beneficiary.militaryBranch')} />
            </div>
            <div className="space-y-2">
              <Label>Military Service: Full Dates</Label>
              <Input className={INPUT_CLASS} placeholder="e.g. 2010-2015" {...register('beneficiary.militaryDates')} />
            </div>
            <div className="space-y-2">
              <Label>Military Service: Rank</Label>
              <Input className={INPUT_CLASS} {...register('beneficiary.militaryRank')} />
            </div>
            <div className="space-y-2">
              <Label>Military Service: Position</Label>
              <Input className={INPUT_CLASS} {...register('beneficiary.militaryPosition')} />
            </div>
            <div className="space-y-2">
              <Label>Military Service: Country</Label>
              <Input className={INPUT_CLASS} {...register('beneficiary.militaryCountry')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Traveled to any countries in last 5 years? (List names)</Label>
            <Input
              className={INPUT_CLASS}
              placeholder="e.g. France, Germany, UK"
              {...register('beneficiary.traveledToCountriesLast5Years')}
            />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>US Visa: Date Issued</Label>
              <Input className={INPUT_CLASS} placeholder="MM/DD/YYYY" {...register('beneficiary.usVisaDateIssued')} />
            </div>
            <div className="space-y-2">
              <Label>US Visa: Classification</Label>
              <Input className={INPUT_CLASS} {...register('beneficiary.usVisaClassification')} />
            </div>
            <div className="space-y-2">
              <Label>US Visa: Number</Label>
              <Input className={INPUT_CLASS} {...register('beneficiary.usVisaNumber')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>US Visa: Lost/Stolen? (Explain)</Label>
            <Input className={INPUT_CLASS} placeholder="If applicable, provide details" {...register('beneficiary.usVisaLostStolenExplain')} />
          </div>
          <div className="space-y-2">
            <Label>US Visa: Canceled/Revoked? (Explain)</Label>
            <Input className={INPUT_CLASS} placeholder="If applicable, provide details" {...register('beneficiary.usVisaCanceledRevokedExplain')} />
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-700">Provide information on your last five U.S. visits.</h5>
            {last5USVisits.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-gray-200 bg-white p-4 flex gap-4"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Arrived: ({index + 1}) (MM/DD/YYYY)</Label>
                    <Controller
                      name={`beneficiary.last5USVisits.${index}.dateArrived` as FieldPath<Step6OtherInfoData>}
                      control={control}
                      render={({ field: f }) => (
                        <Input
                          placeholder="MM/DD/YYYY"
                          className={INPUT_CLASS}
                          value={String(f.value ?? '')}
                          onChange={(e) => f.onChange(formatDateInput(e.target.value))}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Length of Stay:</Label>
                    <Input
                      className={INPUT_CLASS}
                      placeholder="e.g. 2 weeks, 3 months"
                      {...register(`beneficiary.last5USVisits.${index}.lengthOfStay`)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 shrink-0 self-end"
                  onClick={() => last5USVisits.remove(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed border-2 border-gray-300 py-6 text-gray-600 hover:border-[#b72b2b] hover:text-[#b72b2b] hover:bg-red-50/30"
              onClick={() => last5USVisits.append({ dateArrived: '', lengthOfStay: '' })}
            >
              <PlusIcon className="size-4 mr-2" />
              Add U.S. Visit
            </Button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Have you belonged to, contributed to, or worked for any professional, social, or charitable organization?</Label>
              <Controller
                name="beneficiary.belongedToOrganizations"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                    onValueChange={(v) => {
                      const isYes = v === 'yes';
                      field.onChange(isYes);
                      if (!isYes) setValue('beneficiary.organizationsExplain', '');
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="org-yes" />
                      <Label htmlFor="org-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="org-no" />
                      <Label htmlFor="org-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {/* Explain textarea shown only when Yes (Meir's request) */}
              {watch('beneficiary.belongedToOrganizations') === true && (
                <div className="space-y-1 mt-2">
                  <Label className="text-sm">If Yes, please list the organizations:</Label>
                  <textarea
                    className={cn(INPUT_CLASS, 'w-full min-h-[80px] py-2')}
                    placeholder="Describe the organization(s) you've belonged to, contributed to, or worked for"
                    {...register('beneficiary.organizationsExplain')}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Do you have any specialized skills or training, including firearms, explosives, nuclear, biological, or chemical experience?</Label>
              <Controller
                name="beneficiary.specializedSkills"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                    onValueChange={(v) => {
                      const isYes = v === 'yes';
                      field.onChange(isYes);
                      if (!isYes) setValue('beneficiary.skillsExplain', '');
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="skills-yes" />
                      <Label htmlFor="skills-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="skills-no" />
                      <Label htmlFor="skills-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {watch('beneficiary.specializedSkills') === true && (
                <div className="space-y-1 mt-2">
                  <Label className="text-sm">If Yes, please describe the skills/training:</Label>
                  <textarea
                    className={cn(INPUT_CLASS, 'w-full min-h-[80px] py-2')}
                    placeholder="Describe your specialized skills or training"
                    {...register('beneficiary.skillsExplain')}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Have you ever served in, been a member of, or been involved with a paramilitary unit, vigilante unit, rebel group, guerrilla group, or insurgent organization?</Label>
              <Controller
                name="beneficiary.paramilitaryInvolvement"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                    onValueChange={(v) => {
                      const isYes = v === 'yes';
                      field.onChange(isYes);
                      if (!isYes) setValue('beneficiary.paramilitaryExplain', '');
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="paramil-yes" />
                      <Label htmlFor="paramil-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="paramil-no" />
                      <Label htmlFor="paramil-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {watch('beneficiary.paramilitaryInvolvement') === true && (
                <div className="space-y-1 mt-2">
                  <Label className="text-sm">If Yes, please describe the involvement:</Label>
                  <textarea
                    className={cn(INPUT_CLASS, 'w-full min-h-[80px] py-2')}
                    placeholder="Describe the group and your role"
                    {...register('beneficiary.paramilitaryExplain')}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Can you speak and/or read languages other than your native language?</Label>
              <Controller
                name="beneficiary.speakOtherLanguages"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                    onValueChange={(v) => {
                      const speaks = v === 'yes';
                      field.onChange(speaks);
                      if (!speaks) {
                        // Clear hidden languages field to prevent stale data
                        setValue('beneficiary.languagesSpoken', '');
                      }
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="lang-yes" />
                      <Label htmlFor="lang-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="lang-no" />
                      <Label htmlFor="lang-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            {watch('beneficiary.speakOtherLanguages') === true && (
              <div className="space-y-2">
                <Label>If Yes, List the languages that you speak:</Label>
                <Input
                  className={INPUT_CLASS}
                  placeholder="e.g. English, French, Russian"
                  {...register('beneficiary.languagesSpoken')}
                />
              </div>
            )}
          </div>
          <div className="rounded-none border-2 border-black overflow-hidden">
            <div className="border-b-2 border-black bg-white px-4 py-3">
              <h5 className="text-base font-bold text-black">Social Security Number Information</h5>
            </div>
            <div className="divide-y-2 divide-black">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] border-black">
                <div className="border-b border-black sm:border-b-0 sm:border-r border-black p-4 flex items-center">
                  <p className="text-sm text-black">
                    Do you want the Social Security Administration to issue a Social Security number and a card for you?
                  </p>
                </div>
                <Controller
                  name="beneficiary.wantSSAIssueSSN"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ? 'yes' : 'no'}
                      onValueChange={(v) => field.onChange(v === 'yes')}
                      className="contents"
                    >
                      <div className="flex items-center justify-center gap-2 p-4 border-b border-black sm:border-b-0 border-r border-black">
                        <RadioGroupItem value="yes" id="ssn-yes" />
                        <Label htmlFor="ssn-yes" className="font-normal cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center justify-center gap-2 p-4">
                        <RadioGroupItem value="no" id="ssn-no" />
                        <Label htmlFor="ssn-no" className="font-normal cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] border-black">
                <div className="border-b border-black sm:border-b-0 sm:border-r border-black p-4">
                  <p className="text-sm text-black">
                    If YES, Do you authorize disclosure of information from this form to the Department of Homeland Security, the Social Security Administration, and such other U.S. Government agencies as may be required for the purposes of assigning you a Social Security number (SSN) and issuing you a Social Security card and do you authorize the Social Security Administration to share your SSN with the Department of Homeland Security?
                  </p>
                  <p className="text-sm text-black font-medium mt-2">
                    You must answer YES to this question if you want a social security card.
                  </p>
                </div>
                <Controller
                  name="beneficiary.authorizeDisclosureDHS"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ? 'yes' : 'no'}
                      onValueChange={(v) => field.onChange(v === 'yes')}
                      className="contents"
                    >
                      <div className="flex items-center justify-center gap-2 p-4 border-b border-black sm:border-b-0 border-r border-black">
                        <RadioGroupItem value="yes" id="dhs-yes" />
                        <Label htmlFor="dhs-yes" className="font-normal cursor-pointer">Yes</Label>
                      </div>
                      <div className="flex items-center justify-center gap-2 p-4">
                        <RadioGroupItem value="no" id="dhs-no" />
                        <Label htmlFor="dhs-no" className="font-normal cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-700">Social Media - Provide Your Social Media User ID:</h5>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Social Media: Facebook</Label>
                <Input className={INPUT_CLASS} {...register('beneficiary.socialMediaFacebook')} />
              </div>
              <div className="space-y-2">
                <Label>Social Media: Instagram</Label>
                <Input className={INPUT_CLASS} {...register('beneficiary.socialMediaInstagram')} />
              </div>
              <div className="space-y-2">
                <Label>Social Media: LinkedIn</Label>
                <Input className={INPUT_CLASS} {...register('beneficiary.socialMediaLinkedIn')} />
              </div>
              <div className="space-y-2">
                <Label>Social Media: Twitter</Label>
                <Input className={INPUT_CLASS} {...register('beneficiary.socialMediaTwitter')} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {Object.keys(formState.errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {formState.errors.petitioner?.nationalities && (
              <li>
                {petitionerName}: {Array.isArray(formState.errors.petitioner.nationalities)
                  ? (formState.errors.petitioner.nationalities as Array<{ nationality?: { message?: string } }>)[0]?.nationality?.message ?? 'Fill in the nationality field'
                  : (formState.errors.petitioner.nationalities as { message?: string })?.message ?? 'Add at least one nationality'}
              </li>
            )}
            {formState.errors.beneficiary?.nationalities && (
              <li>
                {beneficiaryName}: {Array.isArray(formState.errors.beneficiary.nationalities)
                  ? (formState.errors.beneficiary.nationalities as Array<{ nationality?: { message?: string } }>)[0]?.nationality?.message ?? 'Fill in the nationality field'
                  : (formState.errors.beneficiary.nationalities as { message?: string })?.message ?? 'Add at least one nationality'}
              </li>
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

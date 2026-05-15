import { useEffect, useRef, useState } from 'react';
import { useFormStore } from '@/lib/store/formStore';
import { composeFullName } from '@/lib/nameHelpers';
import { cn } from '@/lib/utils';
import { Heart, Baby, User, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step0IntroProps {
  onContinue: () => void;
}

// Per Meir's feedback:
//  - "Unmarried Child" split into Minor (<21) and Adult (21+)
//  - GC Holder cannot petition for Parents (only Citizens can)
//  - Descriptions specify "under/above the age of 21" for minor/adult
const CASE_OPTIONS = [
  {
    type: 'spouse' as const,
    title: 'My Spouse',
    description: 'I am sponsoring my husband or wife for a Green Card.',
    icon: Heart,
    relationshipLabel: 'Spouse',
    caseTypeLabel: 'spouse',
    availableFor: ['citizen', 'greencard_holder'] as const,
  },
  {
    type: 'child_minor' as const,
    title: 'My Unmarried Minor Child',
    description: 'I am sponsoring my unmarried child, under the age of 21.',
    icon: Baby,
    relationshipLabel: 'Unmarried Minor Child',
    caseTypeLabel: 'child',
    availableFor: ['citizen', 'greencard_holder'] as const,
  },
  {
    type: 'child_adult' as const,
    title: 'My Unmarried Adult Child',
    description: 'I am sponsoring my unmarried child, above the age of 21.',
    icon: User,
    relationshipLabel: 'Unmarried Adult Child',
    caseTypeLabel: 'child',
    availableFor: ['citizen', 'greencard_holder'] as const,
  },
  {
    type: 'parent' as const,
    title: 'My Parent',
    description: 'I am sponsoring my mother or father.',
    icon: Users,
    relationshipLabel: 'Parent',
    caseTypeLabel: 'parent',
    availableFor: ['citizen'] as const, // Green Card Holder cannot petition for parents
  },
];

const CITIZENSHIP_OPTIONS = [
  { value: 'citizen' as const, label: 'American Citizen' },
  { value: 'greencard_holder' as const, label: 'Green Card Holder (Permanent Resident)' },
] as const;

export function Step0Intro({ onContinue }: Step0IntroProps) {
  const {
    petitioner,
    beneficiary,
    caseType,
    petitionerCitizenshipStatus,
    setPetitioner,
    setBeneficiary,
    setCaseType,
    setPetitionerCitizenshipStatus,
  } = useFormStore();

  // Local state mirrors store for instant rendering; syncs on change.
  // Names are split per Meir's request — automation downstream uses firstName only.
  const [petFirst, setPetFirst] = useState(petitioner.firstName || '');
  const [petMiddle, setPetMiddle] = useState(petitioner.middleName || '');
  const [petSurname, setPetSurname] = useState(petitioner.surname || '');
  const [benFirst, setBenFirst] = useState(beneficiary.firstName || '');
  const [benMiddle, setBenMiddle] = useState(beneficiary.middleName || '');
  const [benSurname, setBenSurname] = useState(beneficiary.surname || '');

  // Refs for auto-focus
  const q2Ref = useRef<HTMLDivElement>(null);
  const q3Ref = useRef<HTMLDivElement>(null);
  const q4Ref = useRef<HTMLDivElement>(null);

  // Which questions are unlocked (progressive reveal). Petitioner name needs at least firstName + surname.
  const q1Answered = petFirst.trim().length >= 1 && petSurname.trim().length >= 1;
  const q2Answered = petitionerCitizenshipStatus !== null;
  const q3Answered = caseType !== null;
  const q4Answered = benFirst.trim().length >= 1 && benSurname.trim().length >= 1;
  const allAnswered = q1Answered && q2Answered && q3Answered && q4Answered;

  // Filter case options by citizenship (GCH cannot petition for parents)
  const visibleCaseOptions = CASE_OPTIONS.filter(
    (o) => !petitionerCitizenshipStatus || (o.availableFor as readonly string[]).includes(petitionerCitizenshipStatus)
  );

  // If the user picked a caseType then switched citizenship to one that hides it, clear it.
  useEffect(() => {
    if (!caseType || !petitionerCitizenshipStatus) return;
    const option = CASE_OPTIONS.find((o) => o.type === caseType);
    if (option && !(option.availableFor as readonly string[]).includes(petitionerCitizenshipStatus)) {
      setCaseType(null);
    }
  }, [petitionerCitizenshipStatus, caseType, setCaseType]);

  // Auto-scroll to newly revealed questions
  useEffect(() => { if (q1Answered && !q2Answered) q2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [q1Answered, q2Answered]);
  useEffect(() => { if (q2Answered && !q3Answered) q3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [q2Answered, q3Answered]);
  useEffect(() => { if (q3Answered && !q4Answered) q4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [q3Answered, q4Answered]);

  const syncPetitionerName = () => {
    const parts = { firstName: petFirst.trim(), middleName: petMiddle.trim(), surname: petSurname.trim() };
    if (parts.firstName || parts.surname) {
      setPetitioner({ ...parts, fullName: composeFullName(parts) });
    }
  };

  const syncBeneficiaryName = () => {
    const parts = { firstName: benFirst.trim(), middleName: benMiddle.trim(), surname: benSurname.trim() };
    if (parts.firstName || parts.surname) {
      const rel = caseType ? CASE_OPTIONS.find((o) => o.type === caseType)?.relationshipLabel ?? '' : '';
      setBeneficiary({ ...parts, fullName: composeFullName(parts), relationship: rel });
      if (rel) setPetitioner({ relationship: rel });
    }
  };

  const handleCaseTypeSelect = (type: typeof CASE_OPTIONS[number]['type']) => {
    setCaseType(type);
    const rel = CASE_OPTIONS.find((o) => o.type === type)?.relationshipLabel ?? '';
    setPetitioner({ relationship: rel });
    if (q4Answered) {
      setBeneficiary({ relationship: rel });
    }
  };

  const handleStart = () => {
    syncPetitionerName();
    syncBeneficiaryName();
    onContinue();
  };

  const currentCaseOption = CASE_OPTIONS.find((o) => o.type === caseType);
  const caseTypeLabel = currentCaseOption?.caseTypeLabel ?? '';

  const nameInputClass = 'bg-white border-gray-300 py-3 px-4 min-h-[48px] rounded-lg text-base focus:ring-[#b72b2b] focus:border-[#b72b2b]';

  return (
    <div className="w-full max-w-4xl">
      <div className="overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Red header */}
        <div className="bg-[#b72b2b] px-6 py-6 sm:px-8 sm:py-8 rounded-t-xl">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Welcome to the DRSI Law Family Immigration Questionnaire
          </h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">
            Let us get to know you before we begin.
          </p>
        </div>

        {/* White body — conversational flow */}
        <div className="p-6 sm:p-8 space-y-8">

          {/* ── Q1: Petitioner Name (split into First / Middle / Surname) ── */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Hi &mdash; What is your full name?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-700">First Name <span className="text-red-500">*</span></Label>
                <Input
                  className={nameInputClass}
                  placeholder="First"
                  value={petFirst}
                  onChange={(e) => setPetFirst(e.target.value)}
                  onBlur={syncPetitionerName}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-700">Middle Name</Label>
                <Input
                  className={nameInputClass}
                  placeholder="Middle (optional)"
                  value={petMiddle}
                  onChange={(e) => setPetMiddle(e.target.value)}
                  onBlur={syncPetitionerName}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-gray-700">Last Name <span className="text-red-500">*</span></Label>
                <Input
                  className={nameInputClass}
                  placeholder="Last"
                  value={petSurname}
                  onChange={(e) => setPetSurname(e.target.value)}
                  onBlur={syncPetitionerName}
                />
              </div>
            </div>
          </div>

          {/* ── Q2: Citizenship Status (appears after Q1 answered) ── */}
          {q1Answered && (
            <div
              ref={q2Ref}
              className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Great &mdash; nice to meet you, <span className="text-[#b72b2b]">{petFirst.trim()}</span>.
                <br />
                Are you an American Citizen or a Green Card Holder?
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {CITIZENSHIP_OPTIONS.map((opt) => {
                  const isSelected = petitionerCitizenshipStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPetitionerCitizenshipStatus(opt.value)}
                      className={cn(
                        'flex-1 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 cursor-pointer',
                        'hover:shadow-md hover:border-[#b72b2b]/40',
                        isSelected
                          ? 'border-[#b72b2b] bg-red-50/60 shadow-md'
                          : 'border-gray-200 bg-white'
                      )}
                    >
                      <span className={cn(
                        'text-sm font-semibold',
                        isSelected ? 'text-[#b72b2b]' : 'text-gray-900'
                      )}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Q3: Case Type (appears after Q2 answered) ── */}
          {q1Answered && q2Answered && (
            <div
              ref={q3Ref}
              className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Can I ask who you are applying the visa for?
              </h2>
              <div className={cn(
                'grid gap-4 grid-cols-1',
                visibleCaseOptions.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
              )}>
                {visibleCaseOptions.map((option) => {
                  const isSelected = caseType === option.type;
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleCaseTypeSelect(option.type)}
                      className={cn(
                        'relative flex flex-col items-center text-center rounded-xl border-2 p-5 transition-all duration-200 cursor-pointer',
                        'hover:shadow-md hover:border-[#b72b2b]/40',
                        isSelected
                          ? 'border-[#b72b2b] bg-red-50/60 shadow-md ring-1 ring-[#b72b2b]/20'
                          : 'border-gray-200 bg-white'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full mb-3 transition-colors',
                          isSelected
                            ? 'bg-[#b72b2b] text-white'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className={cn(
                        'text-sm font-semibold mb-0.5',
                        isSelected ? 'text-[#b72b2b]' : 'text-gray-900'
                      )}>
                        {option.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-snug">
                        {option.description}
                      </p>

                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-[#b72b2b] flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Q4: Beneficiary Name (split) ── */}
          {q1Answered && q2Answered && q3Answered && (
            <div
              ref={q4Ref}
              className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Wonderful &mdash; what is your <span className="text-[#b72b2b]">{caseTypeLabel}</span>&rsquo;s full name?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    className={nameInputClass}
                    placeholder="First"
                    value={benFirst}
                    onChange={(e) => setBenFirst(e.target.value)}
                    onBlur={syncBeneficiaryName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">Middle Name</Label>
                  <Input
                    className={nameInputClass}
                    placeholder="Middle (optional)"
                    value={benMiddle}
                    onChange={(e) => setBenMiddle(e.target.value)}
                    onBlur={syncBeneficiaryName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-gray-700">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    className={nameInputClass}
                    placeholder="Last"
                    value={benSurname}
                    onChange={(e) => setBenSurname(e.target.value)}
                    onBlur={syncBeneficiaryName}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Start Button ── */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleStart}
              disabled={!allAnswered}
              className={cn(
                'px-8 py-2.5 text-base font-medium transition-all gap-2',
                allAnswered
                  ? 'bg-[#b72b2b] hover:bg-[#9a2424] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              Start Application
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

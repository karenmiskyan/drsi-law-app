import { cn } from '@/lib/utils';

const STEPS = [
  'Basic Info',
  'Address',
  'Marital',
  'Family',
  'Employment',
  'Other Info',
  'Security',
  'Documents',
] as const;

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  /** Highest step user has visited — steps at or below this are clickable (backwards jump). */
  maxVisitedStep?: number;
  /** Callback when a clickable step is tapped. */
  onStepClick?: (step: number) => void;
}

/**
 * Clickable stepper (per Meir: "Is there a way to go back to a specific section,
 * without clicking Back many times? Just clicking on the number.")
 *
 * Clicking a step ≤ maxVisitedStep navigates directly there. Forward-jumps are
 * blocked — user must progress through Continue so auto-save + validation run.
 */
export function Stepper({ currentStep, totalSteps, maxVisitedStep, onStepClick }: StepperProps) {
  const currentLabel = STEPS[currentStep - 1] ?? 'Step';
  const progressPercent = (currentStep / totalSteps) * 100;
  const maxVisited = maxVisitedStep ?? currentStep;

  const canNavigateTo = (stepNumber: number) =>
    !!onStepClick && stepNumber <= maxVisited && stepNumber !== currentStep;

  const handleClick = (stepNumber: number) => {
    if (canNavigateTo(stepNumber)) onStepClick?.(stepNumber);
  };

  return (
    <div className="mb-6 w-full max-w-5xl mx-auto px-2">
      {/* Mobile: compact progress bar + current step */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/90 text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-white font-semibold text-sm">
            {currentLabel}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#b72b2b] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop: full horizontal stepper — steps are buttons when navigable */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between gap-2">
          {STEPS.slice(0, totalSteps).map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isNavigable = canNavigateTo(stepNumber);

            const circle = (
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  isActive
                    ? 'border-[#b72b2b] bg-[#b72b2b] text-white'
                    : isCompleted
                      ? 'border-[#b72b2b] bg-[#b72b2b] text-white'
                      : 'border-gray-500 bg-transparent text-gray-500',
                  isNavigable && 'hover:ring-2 hover:ring-white/40 cursor-pointer',
                )}
              >
                {stepNumber}
              </div>
            );

            return (
              <div key={stepNumber} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {index > 0 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1',
                        isCompleted || stepNumber - 1 < currentStep ? 'bg-[#b72b2b]' : 'bg-gray-500/50'
                      )}
                    />
                  )}
                  {isNavigable ? (
                    <button
                      type="button"
                      onClick={() => handleClick(stepNumber)}
                      aria-label={`Go to step ${stepNumber}: ${label}`}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-full"
                    >
                      {circle}
                    </button>
                  ) : (
                    circle
                  )}
                  {index < totalSteps - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1',
                        isCompleted ? 'bg-[#b72b2b]' : 'bg-gray-500/50'
                      )}
                    />
                  )}
                </div>
                {isNavigable ? (
                  <button
                    type="button"
                    onClick={() => handleClick(stepNumber)}
                    className={cn(
                      'mt-2 text-center text-xs font-medium sm:text-sm text-gray-500 hover:text-white cursor-pointer transition-colors',
                    )}
                  >
                    {label}
                  </button>
                ) : (
                  <span
                    className={cn(
                      'mt-2 text-center text-xs font-medium sm:text-sm',
                      isActive ? 'text-white' : 'text-gray-500'
                    )}
                  >
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useForm, Controller, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { step7SecurityBackgroundSchema, type Step7SecurityBackgroundData } from '@/lib/schemas';
import { useFormStore } from '@/lib/store/formStore';
import { cn } from '@/lib/utils';
import { useScrollToFirstError } from '@/lib/useScrollToFirstError';
import { preventEnterSubmit } from '@/lib/formKeyGuard';
import { SECURITY_QUESTIONS } from '@/lib/securityQuestions';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Step7SecurityBackgroundProps {
  onBack: () => void;
  onContinue: () => void;
}

const INPUT_CLASS = 'bg-white border-gray-300 py-2.5 px-3 min-h-[42px] rounded-md';

export function Step7SecurityBackground({ onBack, onContinue }: Step7SecurityBackgroundProps) {
  const { step7Data, setStep7Data } = useFormStore();

  const defaultAnswers = step7Data.securityAnswers?.length === SECURITY_QUESTIONS.length
    ? step7Data.securityAnswers
    : SECURITY_QUESTIONS.map(() => ({ answer: null as boolean | null, explanation: '' }));

  const form = useForm<Step7SecurityBackgroundData>({
    resolver: zodResolver(step7SecurityBackgroundSchema),
    defaultValues: {
      securityAnswers: defaultAnswers,
    },
  });

  const { watch, control, register, formState } = form;
  useScrollToFirstError(form);
  const REQUIRED_ASTERISK = <span className="text-red-500 ml-1">*</span>;

  useEffect(() => {
    const subscription = watch((data) => {
      if (data) {
        setStep7Data({
          securityAnswers: data.securityAnswers ?? [],
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStep7Data]);

  const onSubmit = (data: Step7SecurityBackgroundData) => {
    setStep7Data({
      securityAnswers: data.securityAnswers ?? [],
    });
    onContinue();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={preventEnterSubmit} className="space-y-8">
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Please fix the following errors:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Answer all security questions and provide explanations where required</li>
          </ul>
        </div>
      )}

      {/* Security and Background Information */}
      <section className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900">Security and Background Information</h4>
        <h5 className="text-base font-semibold text-gray-800">
          Please Carefully Read Each Question and Answer Truthfully
        </h5>
        <p className="text-sm text-gray-700">
          Your answers will be reviewed by our team. All questions are required.
        </p>
        <div className="rounded-none border-2 border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {SECURITY_QUESTIONS.map((question, index) => {
              const answer = watch(`securityAnswers.${index}.answer` as const);
              const isUnanswered = answer !== true && answer !== false;
              const explanationError = formState.errors.securityAnswers?.[index]?.explanation;
              return (
              <div
                key={index}
                data-field-id={`securityAnswers.${index}.answer`}
                className={cn(
                  'grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] divide-x divide-gray-200',
                  isUnanswered && 'border-2 border-red-500 border-l-0 border-r-0 border-t-0'
                )}
              >
                <div className="p-4">
                  <p className="text-sm text-gray-900">
                    {question}
                    {REQUIRED_ASTERISK}
                  </p>
                  {index === 1 && answer === false ? (
                    <div className="mt-3" data-field-id={`securityAnswers.${index}.explanation`}>
                      <Label className="text-xs text-gray-600">Explanation (required when No) {REQUIRED_ASTERISK}</Label>
                      <textarea
                        className={cn(INPUT_CLASS, 'min-h-[60px] w-full mt-1 resize-y', explanationError && 'border-red-500')}
                        placeholder="Please provide an explanation..."
                        {...register(`securityAnswers.${index}.explanation`)}
                      />
                      {explanationError && (
                        <p className="mt-1 text-sm text-red-500">{typeof explanationError.message === 'string' ? explanationError.message : 'Explanation is required'}</p>
                      )}
                    </div>
                  ) : index !== 1 && answer === true ? (
                    <div className="mt-3">
                      <Label className="text-xs text-gray-600">Explanation (required if Yes)</Label>
                      <textarea
                        className={INPUT_CLASS + ' min-h-[60px] w-full mt-1 resize-y'}
                        placeholder="Please provide an explanation..."
                        {...register(`securityAnswers.${index}.explanation`)}
                      />
                    </div>
                  ) : null}
                </div>
                <Controller
                  name={`securityAnswers.${index}.answer` as FieldPath<Step7SecurityBackgroundData>}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
                      onValueChange={(v) => {
                        field.onChange(v === 'yes');
                        // Clear explanation when answer changes — prevents stale data
                        // from triggering validation on a now-hidden explanation textarea
                        form.setValue(`securityAnswers.${index}.explanation`, '');
                      }}
                      className="contents"
                    >
                      <div className="flex items-center justify-center gap-2 p-4">
                        <RadioGroupItem value="yes" id={`sec-${index}-yes`} />
                        <Label htmlFor={`sec-${index}-yes`} className="font-normal cursor-pointer text-sm">Yes</Label>
                      </div>
                      <div className="flex items-center justify-center gap-2 p-4">
                        <RadioGroupItem value="no" id={`sec-${index}-no`} />
                        <Label htmlFor={`sec-${index}-no`} className="font-normal cursor-pointer text-sm">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            );
            })}
          </div>
        </div>
        <p className="text-sm text-gray-700 italic">
          *If you answered YES to any of the questions above, please provide an explanation in the corresponding box.
        </p>
      </section>

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

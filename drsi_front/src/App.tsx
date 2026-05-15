import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormStore, clearFormStorageForCurrentUser } from '@/lib/store/formStore';
import { splitFullName } from '@/lib/nameHelpers';
import { useAuthStore } from '@/lib/store/authStore';
import { getApplication, saveProgress, submitStage1, logout as apiLogout } from '@/lib/api';
import { LoginPage } from '@/components/LoginPage';
import { Stepper } from '@/components/Stepper';
import { Stage2Dashboard } from '@/components/Stage2Dashboard';
import { SubmittedFormView } from '@/components/SubmittedFormView';
import { Step1BasicInfo } from '@/components/steps/Step1BasicInfo';
import { Step2AddressHistory } from '@/components/steps/Step2AddressHistory';
import { Step3MaritalStatus } from '@/components/steps/Step3MaritalStatus';
import { Step4Family } from '@/components/steps/Step4Family';
import { Step5EmploymentHistory } from '@/components/steps/Step5EmploymentHistory';
import { Step6OtherInformation } from '@/components/steps/Step6OtherInformation';
import { Step7SecurityBackground } from '@/components/steps/Step7SecurityBackground';
import { Step0Intro } from '@/components/steps/Step0Intro';
import { Step8Documents } from '@/components/steps/Step8Documents';
import { Loader2, LogOut, CheckCircle } from 'lucide-react';
import type { DocumentRecord } from '@/lib/api';

const STEP_TITLES: Record<number, string> = {
  0: 'Case Type Selection',
  1: 'Basic Information',
  2: 'Address History',
  3: 'Marital Status',
  4: 'Family',
  5: 'Employment History',
  6: 'Other Information',
  7: 'Security and Background',
  8: 'Documents',
};

const AUTO_SAVE_DELAY = 3000;

function App() {
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);
  // Phase 3.3: toggles the read-only review of the submitted form
  const [showSubmittedView, setShowSubmittedView] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverDocuments, setServerDocuments] = useState<DocumentRecord[]>([]);

  const { currentStep, totalSteps, setCurrentStep, resetForm, maxVisitedStep } = useFormStore();
  const { isAuthenticated, user, clearAuth, setApplicationStatus, applicationStatus } = useAuthStore();

  const formCardBodyRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef<number | undefined>(undefined);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scroll on step change ──
  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = currentStep;
    if (prev === undefined || prev === currentStep) return;
    formCardBodyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  // ── Forced logout listener (401) ──
  useEffect(() => {
    const handler = () => {
      resetForm();
      clearFormStorageForCurrentUser();
      clearAuth();
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [clearAuth, resetForm]);

  // ── Hydrate from backend on auth ──
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setHydrating(false);
      return;
    }

    // CRITICAL: reset to loading state synchronously so the form wizard doesn't
    // mount with stale/empty data before the API fetch completes.
    // Without this, when User B logs in after User A, hydrating is still `false`
    // (from User A's session), causing Step components to mount with empty
    // defaultValues before the API response arrives.
    setHydrating(true);

    let cancelled = false;
    (async () => {
      try {
        // Reset form first to clear any stale data from a previous user (localStorage)
        resetForm();
        // Brief delay so auth token is committed before fetch (fixes soft refresh when switching users)
        await new Promise((r) => setTimeout(r, 100));
        if (cancelled) return;
        const res = await getApplication(useAuthStore.getState().token);
        if (cancelled) return;

        if (res.form_data) {
          const s = useFormStore.getState();
          // Migrate legacy single-field `fullName` into split {firstName, middleName, surname}
          // for records saved before the Phase 2 name-split change.
          const migratePerson = (p: Record<string, unknown> | undefined) => {
            if (!p) return p;
            const needsSplit = !p.firstName && !p.surname && typeof p.fullName === 'string' && p.fullName.trim();
            if (needsSplit) {
              const parts = splitFullName(p.fullName as string);
              return { ...p, ...parts };
            }
            return p;
          };
          if (res.form_data.petitioner) s.setPetitioner(migratePerson(res.form_data.petitioner as Record<string, unknown>) as never);
          if (res.form_data.beneficiary) s.setBeneficiary(migratePerson(res.form_data.beneficiary as Record<string, unknown>) as never);
          if (res.form_data.petitionerAddress) s.setPetitionerAddress(res.form_data.petitionerAddress);
          if (res.form_data.beneficiaryAddress) s.setBeneficiaryAddress(res.form_data.beneficiaryAddress);
          if (res.form_data.futureUSAddress) s.setFutureUSAddress(res.form_data.futureUSAddress as never);
          if (res.form_data.step3Data) s.setStep3Data(res.form_data.step3Data);
          if (res.form_data.step5Data) s.setStep5Data(res.form_data.step5Data);
          if (res.form_data.step6Data) s.setStep6Data(res.form_data.step6Data);
          if (res.form_data.step7Data) s.setStep7Data(res.form_data.step7Data);
          if (res.form_data.step8Documents) s.setStep8Documents(res.form_data.step8Documents as never);
          if (res.form_data.caseType) {
            // Legacy 'child' → 'child_minor' (Phase 2.2 split into minor/adult)
            const ct = res.form_data.caseType as string;
            const normalized = ct === 'child' ? 'child_minor' : ct;
            s.setCaseType(normalized as 'spouse' | 'child_minor' | 'child_adult' | 'parent');
          }
          if (res.form_data.petitionerCitizenshipStatus) s.setPetitionerCitizenshipStatus(res.form_data.petitionerCitizenshipStatus as 'citizen' | 'greencard_holder');
          if (typeof res.form_data.currentStep === 'number') {
            s.setCurrentStep(res.form_data.currentStep as number);
          }
        }
        // Hydrate server documents (from documents table, not form_data)
        if (res.documents) {
          setServerDocuments(res.documents);
        }
        if (res.status) setApplicationStatus(res.status);
      } catch {
        console.warn('Failed to hydrate from server, using local data');
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id, setApplicationStatus, resetForm]);

  // ── Auto-save (debounced) ──
  const getFormSnapshot = useCallback(() => {
    const s = useFormStore.getState();
    return {
      petitioner: s.petitioner,
      beneficiary: s.beneficiary,
      petitionerAddress: s.petitionerAddress,
      beneficiaryAddress: s.beneficiaryAddress,
      futureUSAddress: s.futureUSAddress,
      step3Data: s.step3Data,
      step5Data: s.step5Data,
      step6Data: s.step6Data,
      step7Data: s.step7Data,
      step8Documents: s.step8Documents,
      caseType: s.caseType,
      petitionerCitizenshipStatus: s.petitionerCitizenshipStatus,
      currentStep: s.currentStep,
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = useFormStore.subscribe(() => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await saveProgress(getFormSnapshot());
          setLastSaved(new Date());
        } catch { /* silent */ } finally {
          setSaving(false);
        }
      }, AUTO_SAVE_DELAY);
    });
    return () => {
      unsub();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isAuthenticated, getFormSnapshot]);

  // ── Submit Stage 1 ──
  async function handleSubmitStage1() {
    setSubmitting(true);
    try {
      // Save latest data first
      await saveProgress(getFormSnapshot());
      const res = await submitStage1();
      setApplicationStatus(res.status);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Resubmit after document revision ──
  async function handleResubmitDocuments() {
    setSubmitting(true);
    try {
      // Save latest form data
      await saveProgress(getFormSnapshot());
      // Re-fetch application to get updated document statuses
      const res = await getApplication(useAuthStore.getState().token);
      if (res.documents) {
        setServerDocuments(res.documents);
        // Check if there are still rejected docs
        const stillRejected = res.documents.some(
          (doc) => doc.document_status === 'rejected'
        );
        if (stillRejected) {
          alert('Some documents are still marked as rejected. Please re-upload all rejected documents before resubmitting.');
          return;
        }
      }
      // All clear — go back to the status screen
      // The serverDocuments state is now updated, hasRejectedDocs will be false,
      // so the normal status screen will render
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to resubmit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Logout ──
  async function handleLogout() {
    try { await apiLogout(); } catch { /* ignore */ }
    resetForm();
    clearFormStorageForCurrentUser();
    clearAuth();
  }

  // ── Not authenticated ──
  if (!isAuthenticated) return <LoginPage />;

  // ── Hydrating ──
  if (hydrating) {
    return (
      <div className="min-h-screen bg-[#1a1c1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
          <p className="text-white/70 mt-3 text-sm">Loading your application...</p>
        </div>
      </div>
    );
  }

  // ── Non-draft status screens ──
  if (applicationStatus && applicationStatus !== 'draft') {
    if (applicationStatus === 'stage2_unlocked') {
      return (
        <PageShell>
          <UserBar user={user} saving={saving} lastSaved={lastSaved} onLogout={handleLogout} />
          <Stage2Dashboard />
        </PageShell>
      );
    }

    // Check if any documents were rejected — if so, let the user back into Step 8
    const hasRejectedDocs = serverDocuments.some(
      (doc) => doc.document_status === 'rejected'
    );

    if (hasRejectedDocs) {
      // "Needs Revision" mode — show Step 8 so client can fix rejected documents
      return (
        <PageShell>
          <UserBar user={user} saving={saving} lastSaved={lastSaved} onLogout={handleLogout} />
          <div className="relative z-10 min-h-screen flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-4xl text-center mb-4 px-4">
              <img src="/logo/DRSI LAW- grey trsp.png" alt="DRSI Law" className="mx-auto h-16 sm:h-20 object-contain" />
              <p className="text-white/90 text-sm sm:text-base font-medium mt-2">
                D. R. Sklar & Associates Immigration Law Offices
              </p>
            </div>
            <div className="w-full max-w-4xl">
              <div className="overflow-hidden rounded-t-xl rounded-b-xl bg-white shadow-xl">
                <div className="bg-[#b72b2b] px-6 py-6 sm:px-8 sm:py-8 rounded-t-xl">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Document Revision Required
                  </h1>
                  <p className="mt-2 text-sm text-white/90 sm:text-base">
                    One or more documents need your attention
                  </p>
                </div>
                <div ref={formCardBodyRef} className="rounded-b-xl bg-white p-6 sm:p-8 scroll-mt-4">
                  <Step8Documents
                    onBack={() => {}}
                    onContinue={handleResubmitDocuments}
                    submitting={submitting}
                    serverDocuments={serverDocuments}
                    revisionMode={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </PageShell>
      );
    }

    // If client asked to view their submitted form (read-only)
    if (showSubmittedView) {
      return (
        <PageShell>
          <UserBar user={user} saving={saving} lastSaved={lastSaved} onLogout={handleLogout} />
          <div className="relative z-10 min-h-screen flex flex-col items-center py-8 px-4">
            <SubmittedFormView onBack={() => setShowSubmittedView(false)} />
          </div>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-4">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {applicationStatus === 'stage2_submitted' ? 'Stage 2 Documents Submitted' : 'Application Submitted'}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {applicationStatus === 'stage1_submitted' && 'Your Stage 1 application has been submitted and is being reviewed by our team.'}
                {applicationStatus === 'pending_i130' && 'Your I-130 petition is being processed. We will notify you when Stage 2 is ready.'}
                {applicationStatus === 'stage2_submitted' && 'Our legal team is currently reviewing your NVC documents. We will contact you if anything else is needed.'}
                {applicationStatus === 'completed' && 'Your application is complete. Thank you!'}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                Status: <span className="font-semibold capitalize">{applicationStatus.replace(/_/g, ' ')}</span>
              </div>
              {/* View Submitted Application button (Phase 3.3) */}
              <button
                onClick={() => setShowSubmittedView(true)}
                className="mt-5 w-full inline-flex items-center justify-center rounded-md bg-[#b72b2b] hover:bg-[#9a2424] text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                View My Submitted Application
              </button>
              <button onClick={handleLogout} className="mt-4 block w-full text-sm text-gray-400 hover:text-gray-600">
                Log out
              </button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Main form wizard ──
  return (
    <PageShell>
      <UserBar user={user} saving={saving} lastSaved={lastSaved} onLogout={handleLogout} />

      <div className="relative z-10 min-h-screen flex flex-col items-center py-8 px-4">
        {/* Header */}
        <div className="w-full max-w-4xl text-center mb-4 px-4">
          <img src="/logo/DRSI LAW- grey trsp.png" alt="DRSI Law" className="mx-auto h-16 sm:h-20 object-contain" />
          <p className="text-white/90 text-sm sm:text-base font-medium mt-2">
            D. R. Sklar & Associates Immigration Law Offices
          </p>
          <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">
            FAMILY IMMIGRATION PETITION QUESTIONNAIRE
          </h2>
          {currentStep > 0 && (
            <>
              <p className="text-white/90 text-sm sm:text-base mt-1.5">
                Information About You (The US citizen) and Your Applicant Family Members (The NON-US citizens)
              </p>
              <div className="text-white/80 text-xs sm:text-sm mt-1.5 leading-snug">
                <p>Full Names - Yours and all applicants as written in your passports. Dates - in FULL format of MM/DD/YYYY. Addresses should be with street name and number, postal codes, city and country.</p>
              </div>
            </>
          )}
        </div>

        {/* Step 0 — Intro / Case Type Selection */}
        {currentStep === 0 && (
          <Step0Intro onContinue={() => setCurrentStep(1)} />
        )}

        {/* Steps 1–7 — Form Wizard */}
        {currentStep > 0 && (
          <>
            <Stepper
              currentStep={currentStep}
              totalSteps={totalSteps}
              maxVisitedStep={maxVisitedStep}
              onStepClick={(step) => setCurrentStep(step)}
            />

            {/* Form Card */}
            <div className="w-full max-w-4xl">
              <div className="overflow-hidden rounded-t-xl rounded-b-xl bg-white shadow-xl">
                <div className="bg-[#b72b2b] px-6 py-6 sm:px-8 sm:py-8 rounded-t-xl">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    Family-Based Green Card Application
                  </h1>
                  <p className="mt-2 text-sm text-white/90 sm:text-base">
                    Step {currentStep} of {totalSteps} — {STEP_TITLES[currentStep] ?? 'Basic Information'}
                  </p>
                </div>

                <div ref={formCardBodyRef} className="rounded-b-xl bg-white p-6 sm:p-8 scroll-mt-4">
                  {currentStep === 1 && <Step1BasicInfo onBack={() => setCurrentStep(0)} onContinue={() => setCurrentStep(2)} />}
                  {currentStep === 2 && <Step2AddressHistory onBack={() => setCurrentStep(1)} onContinue={() => setCurrentStep(3)} />}
                  {currentStep === 3 && <Step3MaritalStatus onBack={() => setCurrentStep(2)} onContinue={() => setCurrentStep(4)} />}
                  {currentStep === 4 && <Step4Family onBack={() => setCurrentStep(3)} onContinue={() => setCurrentStep(5)} />}
                  {currentStep === 5 && <Step5EmploymentHistory onBack={() => setCurrentStep(4)} onContinue={() => setCurrentStep(6)} />}
                  {currentStep === 6 && <Step6OtherInformation onBack={() => setCurrentStep(5)} onContinue={() => setCurrentStep(7)} />}
                  {currentStep === 7 && (
                    <Step7SecurityBackground
                      onBack={() => setCurrentStep(6)}
                      onContinue={() => setCurrentStep(8)}
                    />
                  )}
                  {currentStep === 8 && (
                    <Step8Documents
                      onBack={() => setCurrentStep(7)}
                      onContinue={handleSubmitStage1}
                      submitting={submitting}
                      serverDocuments={serverDocuments}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

// ── Shared page shell with background ──
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1c1a] relative">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      {children}
    </div>
  );
}

// ── User bar with save status ──
function UserBar({
  user,
  saving,
  lastSaved,
  onLogout,
}: {
  user: { name: string; email: string } | null;
  saving: boolean;
  lastSaved: Date | null;
  onLogout: () => void;
}) {
  return (
    <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-white/60">
          <span>{user?.email}</span>
          {saving ? (
            <span className="flex items-center gap-1 text-yellow-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          ) : lastSaved ? (
            <span className="text-green-400/70">Saved {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>
        <button onClick={onLogout} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
          <LogOut className="h-3 w-3" /> Log out
        </button>
      </div>
    </div>
  );
}

export default App;

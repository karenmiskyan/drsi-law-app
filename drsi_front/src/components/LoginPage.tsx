import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { sendOtp, verifyOtp } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { setAuth } = useAuthStore();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await sendOtp(email);
      setMessage(res.message);
      setStep('otp');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyOtp(email, code);
      setAuth(res.token, res.user);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1c1a] relative flex items-center justify-center">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <img
            src="/logo/DRSI LAW- grey trsp.png"
            alt="DRSI Law"
            className="mx-auto h-16 sm:h-20 object-contain"
          />
          <p className="text-white/90 text-sm font-medium mt-2">
            D. R. Sklar & Associates Immigration Law Offices
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[#b72b2b] px-6 py-5">
            <h1 className="text-xl font-bold text-white">
              {step === 'email' ? 'Welcome' : 'Enter Verification Code'}
            </h1>
            <p className="text-sm text-white/90 mt-1">
              {step === 'email'
                ? 'Enter your email to access your application'
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#b72b2b] hover:bg-[#a02525] text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send Verification Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    6-Digit Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      className="pl-10 text-center text-lg tracking-[0.5em] font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                {message && (
                  <p className="text-sm text-green-600">{message}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-[#b72b2b] hover:bg-[#a02525] text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Verify & Continue
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setCode('');
                    setError('');
                    setMessage('');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Use a different email
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          No password needed. We'll send you a one-time code.
        </p>
      </div>
    </div>
  );
}

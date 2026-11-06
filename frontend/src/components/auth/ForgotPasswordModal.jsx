import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, Send, KeyRound } from 'lucide-react';
import InputField from '../common/InputField';
import { validateEmail } from '../../utils/authStorage';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '', onNotify }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const err = validateEmail(cleanEmail);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      if (onNotify) {
        onNotify({
          type: 'success',
          message: `Password reset link sent to ${cleanEmail}`
        });
      }
    }, 800);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md p-6 sm:p-8 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        <div className="relative z-10">
          {!isSubmitted ? (
            <div>
              <div className="w-14 h-14 rounded-full bg-[#e8f2fe] text-[#0284c7] flex items-center justify-center mx-auto mb-4">
                <KeyRound size={26} strokeWidth={2.2} />
              </div>

              <h2 id="forgot-password-title" className="text-2xl font-bold text-[#0c2340] text-center mb-1">
                Reset Password
              </h2>
              <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
                Enter your registered email address and we'll send you recovery instructions.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <InputField
                  id="reset-email"
                  type="email"
                  icon={Mail}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  error={error}
                  placeholder="Email Address"
                  autoComplete="email"
                  required
                />

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#145ac7] via-[#0d84d6] to-[#00b4d8] hover:from-[#114eb0] hover:to-[#00a2c3] text-white text-sm font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Link</span>
                        <Send size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-4 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#0c2340] mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                We've sent password reset instructions to <span className="font-semibold text-slate-800">{email}</span>.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

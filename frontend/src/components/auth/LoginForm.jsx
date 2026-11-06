import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Check, AlertCircle } from 'lucide-react';
import InputField from '../common/InputField';
import { validateEmail, validatePassword, mockLogin } from '../../utils/authStorage';

export default function LoginForm({ onSwitchToRegister, onLoginSuccess, onOpenForgotPassword, onNotify }) {
  // MUST be completely empty by default on initial load
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name] || errors.form) {
      setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const cleanEmail = formData.email ? formData.email.trim().toLowerCase() : '';
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) nextErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) nextErrors.password = passErr;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: 'Please enter your email and password.'
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Frontend-only simulation delay (no backend required)
      await new Promise(resolve => setTimeout(resolve, 400));
      const cleanEmail = formData.email.trim().toLowerCase();
      const session = await mockLogin({
        email: cleanEmail,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (onNotify) {
        onNotify({
          type: 'success',
          message: `Welcome back, ${session.fullName}!`
        });
      }

      if (onLoginSuccess) {
        onLoginSuccess(session);
      }
    } catch (err) {
      // Displays "Wrong email ID or password" when credentials are wrong
      const errorMsg = err.message || 'Wrong email ID or password.';
      
      if (onNotify) {
        onNotify({
          type: 'error',
          message: errorMsg
        });
      }

      setErrors(prev => ({
        ...prev,
        form: errorMsg,
        ...(err.field ? { [err.field]: err.fieldMessage || errorMsg } : {})
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Decorative Sparkle Rays at Top Right (from reference) */}
      <div className="absolute -top-3 -right-2 text-[#0284c7] select-none pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="2" y1="12" x2="6" y2="12" />
        </svg>
      </div>

      {/* Top Toggle Switcher: Login / Create Account */}
      <div className="flex items-center justify-center mb-5 sm:mb-6">
        <div className="inline-flex p-1 bg-[#edf2f7] rounded-2xl border border-slate-200/80 shadow-inner">
          <button
            type="button"
            className="px-6 sm:px-7 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0c2340] text-white shadow-sm transition-all duration-200"
          >
            Login
          </button>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0c2340] transition-all duration-200"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Blue Circular Lock Icon Badge */}
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full bg-[#e8f2fe] text-[#0284c7] flex items-center justify-center shadow-sm p-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 00-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Welcome Back & Subtitle */}
      <div className="text-center mb-5 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
          Welcome Back!
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Sign in to continue your journey
        </p>
      </div>

      {/* Prominent Form Error Banner for wrong email or password */}
      {errors.form && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn shadow-sm">
          <AlertCircle size={17} className="text-rose-500 shrink-0" />
          <span className="leading-tight">{errors.form}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-3.5">
        {/* Email Address Field */}
        <InputField
          id="login-email-input"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => {
            if (formData.email) {
              const cleanEmail = formData.email.trim().toLowerCase();
              const err = validateEmail(cleanEmail);
              if (err) setErrors(prev => ({ ...prev, email: err }));
            }
          }}
          placeholder="Enter your email address"
          icon={Mail}
          error={errors.email}
          autoComplete="off"
          required
        />

        {/* Password Field */}
        <InputField
          id="login-password-input"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          icon={Lock}
          showPasswordToggle={true}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="peer sr-only"
              />
              <div className="w-4 h-4 rounded-md border border-slate-300 bg-white peer-checked:bg-[#145ac7] peer-checked:border-[#145ac7] transition-all flex items-center justify-center">
                <Check size={11} className="text-white opacity-0 peer-checked:opacity-100 stroke-[3]" />
              </div>
            </div>
            <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={() => onOpenForgotPassword(formData.email)}
            className="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] hover:underline transition-colors focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        {/* Login Button with Blue-to-Teal Gradient */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#145ac7] via-[#0d84d6] to-[#00b4d8] hover:from-[#114eb0] hover:to-[#00a2c3] text-white font-bold text-sm sm:text-base shadow-md shadow-sky-600/25 hover:shadow-sky-600/35 transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        {/* OR Divider matching reference */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute px-3 bg-white text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Bottom Link: Don't have an account? Create Account */}
        <div className="text-center pt-1">
          <p className="text-xs sm:text-sm text-slate-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-bold text-[#0284c7] hover:text-[#0369a1] hover:underline transition-colors focus:outline-none"
            >
              Create Account
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

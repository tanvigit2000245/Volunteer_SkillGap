import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';
import InputField from '../common/InputField';
import { 
  validateFullName, 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword, 
  calculatePasswordStrength,
  mockRegister 
} from '../../utils/authStorage';

export default function RegisterForm({ onSwitchToLogin, onRegisterSuccess, onNotify }) {
  // MUST be completely empty by default
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name] || errors.form) {
      setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    }

    if (name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    } else if (name === 'confirmPassword' && formData.password) {
      if (formData.password !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const validateAll = () => {
    const nextErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword)
    };

    const hasErrors = Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: 'Please fill in all required fields accurately.'
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 450));
      const newUser = await mockRegister({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      if (onNotify) {
        onNotify({
          type: 'success',
          message: `Account created successfully! Welcome, ${newUser.fullName}.`
        });
      }

      if (onRegisterSuccess) {
        onRegisterSuccess(newUser);
      }
    } catch (err) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: err.message || 'Registration failed.'
        });
      }
      setErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Decorative Sparkle Rays at Top Right */}
      <div className="absolute -top-3 -right-2 text-[#0284c7] select-none pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
          <line x1="2" y1="12" x2="6" y2="12" />
        </svg>
      </div>

      {/* Top Toggle Switcher: Login / Create Account */}
      <div className="flex items-center justify-center mb-4 sm:mb-5">
        <div className="inline-flex p-1 bg-[#edf2f7] rounded-2xl border border-slate-200/80 shadow-inner">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="px-5 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0c2340] transition-all duration-200"
          >
            Login
          </button>
          <button
            type="button"
            className="px-6 sm:px-7 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0c2340] text-white shadow-sm transition-all duration-200"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Blue Circular Icon Badge */}
      <div className="flex justify-center mb-2.5">
        <div className="w-12 h-12 rounded-full bg-[#e8f2fe] text-[#0284c7] flex items-center justify-center shadow-sm p-3">
          <UserPlus size={22} strokeWidth={2.2} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-4 sm:mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
          Create Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Join our community and start volunteering
        </p>
      </div>

      {/* Global Form Error */}
      {errors.form && (
        <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-3">
        {/* Full Name */}
        <InputField
          id="register-fullName-input"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={() => {
            if (formData.fullName) {
              const err = validateFullName(formData.fullName);
              if (err) setErrors(prev => ({ ...prev, fullName: err }));
            }
          }}
          placeholder="Enter your full name"
          icon={User}
          error={errors.fullName}
          autoComplete="off"
          required
        />

        {/* Email Address */}
        <InputField
          id="register-email-input"
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

        {/* Password */}
        <div>
          <InputField
            id="register-password-input"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password (min. 8 characters)"
            icon={Lock}
            showPasswordToggle={true}
            error={errors.password}
            autoComplete="new-password"
            required
          />

          {/* Password strength meter */}
          {formData.password && (
            <div className="mt-1 px-1 space-y-0.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Strength:</span>
                <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: passwordStrength.width }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <InputField
          id="register-confirmPassword-input"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          icon={Lock}
          showPasswordToggle={true}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        {/* Default Volunteer Role Note */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
          <CheckCircle size={14} className="text-[#00a884] shrink-0" />
          <span>You will register as a volunteer to connect with community causes.</span>
        </div>

        {/* Create Account Button */}
        <div className="pt-1.5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#145ac7] via-[#0d84d6] to-[#00b4d8] hover:from-[#114eb0] hover:to-[#00a2c3] text-white font-bold text-sm sm:text-base shadow-md shadow-sky-600/25 hover:shadow-sky-600/35 transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative my-2.5 flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute px-3 bg-white text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Bottom Link: Already have an account? Login */}
        <div className="text-center pt-0.5">
          <p className="text-xs sm:text-sm text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-[#0284c7] hover:text-[#0369a1] hover:underline transition-colors focus:outline-none"
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

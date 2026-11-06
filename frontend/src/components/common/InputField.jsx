import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function InputField({
  label,
  id,
  name,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  placeholder,
  error,
  icon: Icon,
  showPasswordToggle = false,
  autoComplete = 'off',
  disabled = false,
  required = false,
  helper,
  ariaDescribedBy
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const effectiveType = showPasswordToggle
    ? (isPasswordVisible ? 'text' : 'password')
    : type;

  return (
    <div className="w-full flex flex-col space-y-1 text-left group">
      {label && (
        <label
          htmlFor={id}
          className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-700 select-none transition-colors duration-200 group-focus-within:text-[#0b2b57]"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-1" title="Required">*</span>}
          </span>
          {helper && <span className="text-[11px] text-slate-400 font-normal">{helper}</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Left Icon */}
        {Icon && (
          <div
            className={`absolute left-4 flex items-center pointer-events-none transition-colors duration-200 ${
              error
                ? 'text-rose-500'
                : isFocused
                ? 'text-[#0284c7]'
                : 'text-slate-400'
            }`}
          >
            <Icon size={18} strokeWidth={2} />
          </div>
        )}

        {/* Input element with soft light background matching reference screenshot */}
        <input
          id={id}
          name={name || id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : ariaDescribedBy}
          className={`w-full py-3.5 text-sm text-slate-800 placeholder-slate-400 rounded-2xl border transition-all duration-200 outline-none
            ${Icon ? 'pl-11' : 'pl-4'}
            ${showPasswordToggle ? 'pr-11' : 'pr-4'}
            ${
              error
                ? 'border-rose-400 bg-rose-50/30 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                : isFocused
                ? 'border-[#0284c7] bg-white ring-4 ring-sky-100/80 shadow-sm'
                : 'border-slate-200/90 bg-[#eef3f8]/70 hover:bg-[#eef3f8] hover:border-slate-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
          `}
        />

        {/* Password Visibility Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-[#0284c7] transition-all duration-200 rounded-lg"
            tabIndex={-1}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            title={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} strokeWidth={1.8} className="transition-transform duration-200 hover:scale-110" />
            ) : (
              <Eye size={18} strokeWidth={1.8} className="transition-transform duration-200 hover:scale-110" />
            )}
          </button>
        )}
      </div>

      {/* Clear Validation Error Message */}
      {error && (
        <div
          id={`${id}-error`}
          className="flex items-center gap-1.5 pt-0.5 text-xs text-rose-500 animate-fadeIn"
          role="alert"
        >
          <AlertCircle size={13} className="shrink-0" />
          <span className="leading-tight font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}

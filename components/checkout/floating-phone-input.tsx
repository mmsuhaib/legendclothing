"use client";

import React, { useState } from "react";

interface FloatingPhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
}

// Crisp vector Sri Lanka Flag Component
function SriLankaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-[2px] shadow-2xs overflow-hidden shrink-0`}
      viewBox="0 0 600 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Golden Border */}
      <rect width="600" height="300" fill="#FFBE29" />
      {/* Dark Red/Maroon field for the Lion */}
      <rect x="180" y="30" width="390" height="240" fill="#8D153A" />
      {/* Green vertical stripe */}
      <rect x="40" y="30" width="60" height="240" fill="#00534E" />
      {/* Saffron/Orange vertical stripe */}
      <rect x="110" y="30" width="60" height="240" fill="#EB7400" />
      {/* Golden Lion representation with sword */}
      <g fill="#FFBE29">
        {/* Four bo leaves at the corners */}
        <path d="M200 50 c15 5 20 20 20 20 s-5 15 -20 20 c-5 -15 -5 -35 0 -40 z" />
        <path d="M550 50 c-15 5 -20 20 -20 20 s5 15 20 20 c5 -15 5 -35 0 -40 z" />
        <path d="M200 250 c15 -5 20 -20 20 -20 s-5 -15 -20 -20 c-5 15 -5 35 0 40 z" />
        <path d="M550 250 c-15 -5 -20 -20 -20 -20 s5 -15 20 -20 c5 15 5 35 0 40 z" />
        {/* Stylized lion body & sword */}
        <circle cx="340" cy="140" r="32" />
        <rect x="340" y="140" width="80" height="40" rx="10" />
        <circle cx="410" cy="115" r="22" />
        <rect x="420" y="85" width="10" height="70" rx="3" transform="rotate(25 425 120)" />
        <rect x="405" y="100" width="40" height="8" rx="2" transform="rotate(25 425 120)" />
      </g>
    </svg>
  );
}

export default function FloatingPhoneInput({
  label,
  value,
  onChange,
  error,
  required = false,
  name,
  id,
  placeholder = "7X XXX XXXX",
}: FloatingPhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, "-");

  const hasValue = Boolean(value && value.trim().length > 0);
  const isFloating = isFocused || hasValue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and spaces
    let raw = e.target.value.replace(/[^\d\s]/g, "");
    // If user starts typing with 0 (e.g. 077), strip the leading 0 when using +94 prefix
    if (raw.startsWith("0")) {
      raw = raw.substring(1);
    }
    onChange(raw);
  };

  return (
    <div className="w-full">
      <div
        className={`relative w-full rounded-md border bg-white transition-all duration-200 flex items-center ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : isFocused
            ? "border-blue-600 ring-1 ring-blue-600"
            : "border-[#D9D5CF] hover:border-[#A8A29E]"
        }`}
      >
        {/* Sri Lanka Flag & +94 Country Code prefix */}
        <div className="flex items-center gap-1.5 pl-3.5 pr-2 pt-3.5 pointer-events-none select-none shrink-0">
          <SriLankaFlag />
          <span className="text-xs font-medium text-[#121212]">+94</span>
          <span className="w-px h-4 bg-[#E8E5E0] ml-1" />
        </div>

        {/* Floating Label */}
        <label
          htmlFor={inputId}
          className={`absolute left-[92px] transition-all duration-150 pointer-events-none select-none tracking-wide ${
            isFloating
              ? "top-2 text-[10px] font-semibold text-[#66635F] uppercase tracking-wider !left-3.5"
              : "top-[15px] text-xs text-[#8E8B85]"
          } ${error ? "text-red-500" : isFocused ? "text-blue-600" : ""}`}
        >
          {label} {required ? <span className="text-red-500 font-semibold">*</span> : <span className="text-[#8E8B85] font-normal text-[11px]">(Optional)</span>}
        </label>

        {/* Phone Input */}
        <input
          id={inputId}
          name={name}
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          className="w-full bg-transparent px-2.5 pt-5 pb-1.5 text-xs text-[#121212] font-normal focus:outline-none rounded-r-md h-[52px]"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-600 mt-1 pl-1 flex items-center gap-1 font-medium animate-fadeIn">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
}

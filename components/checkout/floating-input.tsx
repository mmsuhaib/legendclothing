"use client";

import React, { useState } from "react";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export default function FloatingInput({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  required,
  type = "text",
  id,
  name,
  className = "",
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, "-");

  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="w-full">
      <div
        className={`relative w-full rounded-md border bg-white transition-all duration-200 ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : isFocused
            ? "border-blue-600 ring-1 ring-blue-600"
            : "border-[#D9D5CF] hover:border-[#A8A29E]"
        }`}
      >
        <label
          htmlFor={inputId}
          className={`absolute left-3.5 transition-all duration-150 pointer-events-none select-none tracking-wide ${
            isFloating
              ? "top-2 text-[10px] font-semibold text-[#66635F] uppercase tracking-wider"
              : "top-[15px] text-xs text-[#8E8B85]"
          } ${error ? "text-red-500" : isFocused ? "text-blue-600" : ""}`}
        >
          {label} {required && <span className="text-red-500 font-semibold">*</span>}
        </label>
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`w-full bg-transparent px-3.5 pt-5 pb-1.5 text-xs text-[#121212] font-normal focus:outline-none rounded-md h-[52px] ${className}`}
          {...props}
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

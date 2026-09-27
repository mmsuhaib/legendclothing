"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FloatingSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}

export default function FloatingSelect({
  label,
  value,
  onChange,
  options,
  error,
  required = true,
  id,
  name,
  className = "",
  ...props
}: FloatingSelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const selectId = id || name || label.toLowerCase().replace(/\s+/g, "-");

  const hasValue = Boolean(value && String(value).length > 0);
  const isFloating = true; // For select with a default value like "Sri Lanka", label is always floating cleanly

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
          htmlFor={selectId}
          className={`absolute left-3.5 top-2 text-[10px] font-semibold text-[#66635F] uppercase tracking-wider pointer-events-none select-none ${
            error ? "text-red-500" : isFocused ? "text-blue-600" : ""
          }`}
        >
          {label} {required && <span className="text-red-500 font-semibold">*</span>}
        </label>
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent px-3.5 pt-5 pb-1.5 text-xs text-[#121212] font-normal focus:outline-none rounded-md h-[52px] appearance-none cursor-pointer pr-10 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8E8B85]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-red-600 mt-1 pl-1 flex items-center gap-1 font-medium animate-fadeIn">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
}

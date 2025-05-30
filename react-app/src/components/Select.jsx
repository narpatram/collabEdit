import React from 'react';

/**
 * Reusable Select component for consistent dropdown styling
 * @param {Object} props
 * @param {string} props.value - Current selected value
 * @param {function(string): void} props.onChange - Handler for value changes
 * @param {Array} props.options - Array of option objects with value and label
 * @param {string} props.width - Tailwind width class (e.g., "w-12", "w-20")
 * @param {string} [props.placeholder] - Optional placeholder text
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Whether the select is disabled
 */
export const Select = ({
  value,
  onChange,
  options,
  width = "w-16",
  placeholder = "",
  className = "",
  disabled = false,
  ...props
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`text-xs bg-white/50 border border-gray-200 rounded px-1 py-0.5 font-medium text-gray-700 cursor-pointer ${width} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/70 focus:bg-white focus:ring-2 focus:ring-indigo-200'
      } ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}; 
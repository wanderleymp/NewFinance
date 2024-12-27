import React from 'react';

interface LoginInputProps {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginInput: React.FC<LoginInputProps> = ({
  label,
  id,
  name,
  type,
  value,
  error,
  placeholder,
  onChange,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300'
              : 'border-gray-300'
          }`}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
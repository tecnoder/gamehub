'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { IconType } from 'react-icons';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outline';
}

const variantClasses = {
  default: 'bg-gray-700 border-gray-600 focus:border-purple-500',
  filled: 'bg-gray-800 border-transparent focus:bg-gray-700 focus:border-purple-500',
  outline: 'bg-transparent border-gray-600 focus:border-purple-500',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              block rounded-md
              ${Icon && iconPosition === 'left' ? 'pl-10' : 'pl-3'}
              ${Icon && iconPosition === 'right' ? 'pr-10' : 'pr-3'}
              py-2 text-sm
              placeholder-gray-400 text-white
              border
              ${variantClasses[variant]}
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
            {...props}
          />
          {Icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 
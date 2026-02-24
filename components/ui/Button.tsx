'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  variant?: 'filter' | 'export';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  active = false,
  variant = 'filter',
  className = '',
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm';
  
  const variantStyles = {
    filter: active
      ? 'bg-[#1470e6] text-white shadow-md'
      : 'bg-white text-[#2c3e50] border border-[#e9ecef] hover:bg-[#f8f9fa] hover:border-[#1470e6]',
    export: 'bg-white text-[#2c3e50] border border-[#e9ecef] hover:bg-[#f8f9fa] hover:border-[#1470e6]',
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

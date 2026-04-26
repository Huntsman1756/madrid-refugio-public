import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'pill';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[var(--ds-black)] text-white hover:bg-[var(--ds-gray-900)] active:scale-[0.98] px-4 py-2 rounded-lg shadow-sm font-semibold transition-all duration-150",
    secondary: "bg-[var(--ds-white)] text-[var(--ds-black)] hover:bg-[var(--ds-gray-50)] px-4 py-2 rounded-lg border border-[var(--ds-gray-100)] shadow-[var(--shadow-border)] font-semibold",
    pill: "bg-[var(--climate-green)]/10 text-[var(--climate-green)] hover:bg-[var(--climate-green)]/15 px-[10px] py-0 rounded-full text-xs font-medium tracking-normal",
  };

  const variantClass = variants[variant] || variants.primary;

  return (
    <button 
      className={`${baseClasses} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

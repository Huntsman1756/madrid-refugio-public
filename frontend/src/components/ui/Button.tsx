import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'pill';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[var(--climate-terracotta)] text-[var(--ds-white)] hover:opacity-90 px-4 py-2 rounded-[18px] shadow-[0_12px_24px_rgba(212,140,78,0.22)] font-semibold",
    secondary: "bg-[var(--ds-white)] text-[var(--ds-black)] hover:bg-[var(--ds-gray-50)] px-4 py-2 rounded-[18px] border border-[var(--ds-gray-100)] shadow-[var(--shadow-border)] font-semibold",
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

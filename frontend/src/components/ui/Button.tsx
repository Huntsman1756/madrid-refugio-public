import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'pill';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[var(--ds-black)] text-[var(--ds-white)] hover:bg-[#333] px-4 py-2 rounded-md shadow-[var(--shadow-ring-light)]",
    secondary: "bg-[var(--ds-white)] text-[var(--ds-black)] hover:bg-[var(--ds-gray-50)] px-4 py-2 rounded-md shadow-[var(--shadow-border)]",
    pill: "bg-[#ebf5ff] text-[#0068d6] hover:bg-[#dbeafe] px-[10px] py-0 rounded-full text-xs font-medium tracking-normal",
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

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 0 | 1 | 2 | 3;
  children: React.ReactNode;
}

export function Card({ level = 2, children, className = '', ...props }: CardProps) {
  // Vercel depth levels
  const shadowLevels = {
    0: "",
    1: "shadow-[var(--shadow-border)]", // Just the ring
    2: "shadow-[var(--shadow-card-subtle)]", // Ring + minimal lift
    3: "shadow-[var(--shadow-card)]", // Featured cards with inner highlight
  };

  const shadowClass = shadowLevels[level] || shadowLevels[2];

  return (
    <div 
      className={`bg-[var(--ds-white)] rounded-lg ${shadowClass} overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

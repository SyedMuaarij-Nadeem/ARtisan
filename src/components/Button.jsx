import { forwardRef } from 'react';

export const Button = forwardRef(({ children, className = '', variant = 'primary', ...props }, ref) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <button
      ref={ref}
      className={`${baseClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

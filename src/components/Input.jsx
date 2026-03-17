import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(({ className = '', icon: Icon, type = 'text', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/80 pointer-events-none z-10 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        ref={ref}
        type={inputType}
        className={`input-field relative z-0 ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-accent transition-colors focus:outline-none z-10"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
});

Input.displayName = 'Input';

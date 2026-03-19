import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { RoleSelector } from '../components/RoleSelector';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithGoogle, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('User');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login('test@artisan.com', 'password');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card w-full p-4 sm:p-5 font-poppins">
      <div className="text-center mb-3">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight">Welcome Back</h2>
        <p className="text-white/60 text-xs sm:text-sm font-light">Log in to continue to ARtisan</p>
      </div>

      <RoleSelector selectedRole={role} onChange={setRole} />

      <form className="space-y-2 sm:space-y-3" onSubmit={handleLogin}>
        <div className="space-y-1 font-light">
          <Input type="email" placeholder="Email Address" icon={Mail} />
        </div>
        <div className="space-y-1 font-light">
          <Input type="password" placeholder="Password" icon={Lock} />
        </div>

        <div className="flex justify-end mt-0.5 font-light">
          <Link to="/forgot-password" state={{ direction: 'swipe-left' }} className="text-[10px] sm:text-xs text-accent hover:text-white transition-colors">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="py-2 mt-1" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        <div className="relative flex items-center py-1 sm:py-2">
          <div className="grow border-t border-white/10"></div>
          <span className="shrink-0 mx-4 text-white/40 text-xs sm:text-sm font-light">OR</span>
          <div className="grow border-t border-white/10"></div>
        </div>

        <Button type="button" variant="secondary" className="py-2" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </form>

      <p className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-white/60 font-light">
        Don't have an account?{' '}
        <Link to="/signup" state={{ direction: 'flip-right' }} className="text-accent hover:text-white transition-colors font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

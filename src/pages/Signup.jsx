import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function Signup() {
  const navigate = useNavigate();
  const { loginWithGoogle, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup('test@artisan.com', 'password');
      navigate('/login', { state: { direction: 'flip-left' } });
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
    <div className="glass-card w-full p-5 sm:p-6">
      <div className="text-center mb-4 sm:mb-5">
        <h2 className="text-2xl sm:text-3xl font-brand mb-1">Create Account</h2>
        <p className="text-white/60 text-sm">Join ARtisan today</p>
      </div>

      <form className="space-y-3 sm:space-y-4" onSubmit={handleSignup}>
        <div className="space-y-1">
          <Input type="text" placeholder="Full Name" icon={User} />
        </div>
        <div className="space-y-1">
          <Input type="email" placeholder="Email Address" icon={Mail} />
        </div>
        <div className="space-y-1">
          <Input type="password" placeholder="Password" icon={Lock} />
        </div>
        <div className="space-y-1">
          <Input type="password" placeholder="Confirm Password" icon={Lock} />
        </div>
        
        <div className="pt-1">
          <Button type="submit" className="py-2.5" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </div>

        <div className="relative flex items-center py-2 sm:py-3">
          <div className="grow border-t border-white/10"></div>
          <span className="shrink-0 mx-4 text-white/40 text-sm">OR</span>
          <div className="grow border-t border-white/10"></div>
        </div>

        <Button type="button" variant="secondary" className="py-2.5" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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

      <p className="mt-4 sm:mt-5 text-center text-xs sm:text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" state={{ direction: 'flip-left' }} className="text-accent hover:text-white transition-colors font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}

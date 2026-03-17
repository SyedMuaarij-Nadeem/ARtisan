import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Navbar */}
      <header className="relative z-10 w-full border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="shrink-0 flex items-center gap-3">
              <img src="/images/artisanlogo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <span className="font-brand text-2xl tracking-wider">
                AR<span className="text-accent">tisan</span>
              </span>
            </div>

            {/* Navigation links & User actions */}
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-8">
                <a href="#features" className="text-white/70 hover:text-accent transition-colors text-sm font-medium">Features</a>
                <a href="#about" className="text-white/70 hover:text-accent transition-colors text-sm font-medium">About</a>
                <a href="#contact" className="text-white/70 hover:text-accent transition-colors text-sm font-medium">Contact</a>
              </nav>

              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                {user ? (
                  <>
                    <span className="text-sm text-white/50 hidden sm:block">{user.email}</span>
                    <button onClick={handleLogout} className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                      Login
                    </Link>
                    <Link to="/signup">
                      <Button className="px-6! py-2! text-sm!">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="grow flex items-center relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Design the future with <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-accent to-blue-500 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)] font-brand">ARtisan</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl leading-relaxed">
              Step into the next generation of AI and Augmented Reality. Create immersive 3D experiences seamlessly, powered by the most advanced neural engines.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button className="py-4! px-8! text-lg w-full sm:w-auto shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  {user ? "Go to Dashboard" : "Start Creating Now"}
                </Button>
              </Link>
              {!user && (
                <Link to="/login">
                  <Button variant="secondary" className="py-4! px-8! text-lg w-full sm:w-auto">
                    View Demo
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Quick stats / trust signals */}
            <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-8 text-left">
              <div>
                <h4 className="text-3xl font-brand text-accent mb-2">10k+</h4>
                <p className="text-sm justify-center text-white/50 font-medium tracking-wide uppercase">Active Creators</p>
              </div>
              <div>
                <h4 className="text-3xl font-brand text-accent mb-2">1M+</h4>
                <p className="text-sm justify-center text-white/50 font-medium tracking-wide uppercase">AI Models Generated</p>
              </div>
              <div className="hidden md:block">
                <h4 className="text-3xl font-brand text-accent mb-2">4.9/5</h4>
                <p className="text-sm justify-center text-white/50 font-medium tracking-wide uppercase">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-black/20 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} ARtisan Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-white/40 hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-white/40 hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

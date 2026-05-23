import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Chrome, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import bgImg from '../assets/login (3).jpg'; 

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, user, updateDisplayName } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 font-inter overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={bgImg} className="w-full h-full object-cover brightness-[0.45]" alt="bg" />
          <div className="absolute inset-0 bg-gradient-to-bl from-[#1A1A1A] via-[#1A1A1A]/30 to-transparent" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-sm sm:max-w-md backdrop-blur-3xl bg-[#1A1A1A]/80 border border-white/5 p-8 sm:p-12 text-center shadow-2xl"
        >
          <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-[#8B5E3C] mx-auto mb-6 sm:mb-8" />
          <h2 className="text-xl sm:text-2xl font-light tracking-widest uppercase mb-4 text-white">Join Denied</h2>
          <p className="text-xs text-white/60 uppercase tracking-widest leading-relaxed mb-8 sm:mb-10">
            It looks like you're already part of the studio! No need to register again.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#8B5E3C] text-white py-4 sm:py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white hover:text-black transition-all duration-700 shadow-2xl"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      await updateDisplayName(name);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. ' + err.message);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google registration failed.');
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-4 md:p-6 font-inter overflow-hidden">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img src={bgImg} className="w-full h-full object-cover scale-105 brightness-[0.45] contrast-[1.1]" alt="Studio Background" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#1A1A1A] via-[#1A1A1A]/30 to-transparent" />
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/landing" 
        className="absolute top-4 sm:top-8 left-4 sm:left-8 z-20 flex items-center gap-2 sm:gap-3 text-[11px] sm:text-[12px] uppercase tracking-[0.3em] text-white/50 hover:text-white transition-all group"
      >
        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, x: 30, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg backdrop-blur-3xl bg-[#1A1A1A]/80 border border-white/5 p-6 sm:p-10 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-y-auto custom-scrollbar my-16 sm:my-8"
      >
        <div className="text-center mb-8 sm:mb-12">
          <Link to="/" className="text-2xl sm:text-3xl tracking-[0.4em] sm:tracking-[0.6em] uppercase font-light mb-4 block text-white">
            AR<span className="italic font-serif text-[#8B5E3C]">tisan</span>
          </Link>
          <h2 className="text-lg sm:text-xl font-light text-white/90 tracking-widest uppercase mt-5 sm:mt-8">Begin Journey</h2>
          <div className="w-12 h-[1px] bg-[#8B5E3C] mx-auto mt-4 opacity-50" />
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-[10px] sm:text-[11px] uppercase tracking-wider"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Full Name</label>
            <div className="relative group">
              <UserPlus className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#8B5E3C] transition-colors" />
              <input 
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 px-7 sm:px-8 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#8B5E3C] transition-all duration-500"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Identity / Email</label>
            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#8B5E3C] transition-colors" />
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 px-7 sm:px-8 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#8B5E3C] transition-all duration-500"
                placeholder="name@studio.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#8B5E3C] transition-colors" />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 px-7 sm:px-8 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#8B5E3C] transition-all duration-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Verify Password</label>
            <div className="relative group">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#8B5E3C] transition-colors" />
              <input 
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 px-7 sm:px-8 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#8B5E3C] transition-all duration-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading} type="submit"
            className="w-full bg-[#8B5E3C] text-white py-4 sm:py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white hover:text-black transition-all duration-700 shadow-2xl flex items-center justify-center gap-4 group mt-4 sm:mt-6"
          >
            {loading ? 'Creating...' : 'Register Identity'}
            <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform duration-500" />
          </button>
        </form>

        <div className="relative my-8 sm:my-12">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[9px] uppercase tracking-[0.5em] bg-transparent text-white/20">
            <span className="bg-[#1A1A1A] px-4">Studio Bridge</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full border border-white/10 bg-white/5 py-4 sm:py-5 text-[10px] uppercase tracking-[0.4em] font-bold text-white/80 hover:bg-white hover:text-black transition-all duration-700 flex items-center justify-center gap-4"
        >
          <Chrome className="w-4 h-4" />
          Join with Google
        </button>

        <p className="text-center mt-8 sm:mt-12 text-white/30 text-[10px] uppercase tracking-[0.3em]">
          Already registered? {' '}
          <Link to="/login" className="text-[#8B5E3C] font-bold hover:text-white transition-colors ml-2 underline underline-offset-4">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}

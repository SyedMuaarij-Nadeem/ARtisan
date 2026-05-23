import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import bgImg from '../assets/login (3).jpg'; 

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Recovery instructions sent to your inbox.');
    } catch (err) {
      setError('Recovery failed. ' + err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-4 md:p-6 font-inter overflow-hidden">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img src={bgImg} className="w-full h-full object-cover scale-105 brightness-[0.45] contrast-[1.1]" alt="Studio Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/20 to-transparent" />
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
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg backdrop-blur-3xl bg-[#1A1A1A]/80 border border-white/5 p-6 sm:p-10 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-y-auto custom-scrollbar my-16 sm:my-8"
      >
        <div className="text-center mb-8 sm:mb-12">
          <Link to="/" className="text-2xl sm:text-3xl tracking-[0.4em] sm:tracking-[0.6em] uppercase font-light mb-4 block text-white">
            AR<span className="italic font-serif text-[#8B5E3C]">tisan</span>
          </Link>
          <h2 className="text-lg sm:text-xl font-light text-white/90 tracking-widest uppercase mt-5 sm:mt-8">Recover Access</h2>
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

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400 text-[10px] sm:text-[11px] uppercase tracking-wider"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Identity / Email</label>
            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#8B5E3C] transition-colors" />
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 px-7 sm:px-8 py-3 sm:py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#8B5E3C] transition-all duration-500"
                placeholder="name@studio.com"
              />
            </div>
          </div>

          <button 
            disabled={loading} type="submit"
            className="w-full bg-[#8B5E3C] text-white py-4 sm:py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white hover:text-black transition-all duration-700 shadow-2xl"
          >
            {loading ? 'Initializing Recovery...' : 'Send Recovery Link'}
          </button>
        </form>

        <div className="text-center mt-8 sm:mt-12">
          <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 hover:text-white flex items-center justify-center gap-4 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Return to Initialization
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

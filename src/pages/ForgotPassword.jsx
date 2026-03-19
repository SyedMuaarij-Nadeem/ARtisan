import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="glass-card w-full p-6 sm:p-8 transition-all duration-500 flex flex-col justify-center">

      {!isSubmitted ? (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold mb-1 tracking-tight">Reset Password</h2>
            <p className="text-white/60 text-sm sm:text-base">Enter your email to receive a reset link</p>
          </div>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Input type="email" placeholder="Email Address" icon={Mail} required />
            </div>

            <Button type="submit">Send Reset Link</Button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-6 animate-[pulse_2s_infinite]">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-white/60 text-sm sm:text-base mb-6 sm:mb-8">We've sent a password reset link to your email address.</p>
        </motion.div>
      )}

      <div className="mt-6 sm:mt-8 text-center">
        <Link to="/login" state={{ direction: 'swipe-right' }} className="text-sm text-white/60 hover:text-white transition-colors">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}

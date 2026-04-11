import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { LogIn, UserPlus, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.header
            initial={{ y: -100, x: "-50%", opacity: 0 }}
            animate={hidden ? { y: -100, x: "-50%", opacity: 0 } : { y: 0, x: "-50%", opacity: 1 }}
            transition={{
                y: { duration: 0.5, ease: "easeOut" },
                opacity: { duration: 0.4, ease: "linear" }
            }}
            className="fixed top-4 left-1/2 z-50 w-[95%] sm:w-[90%] md:w-[85%] max-w-7xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs shadow-2xl shadow-cyan-500/10"
        >
            <div className="mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Logo */}
                    <div className="shrink-0 flex items-center gap-2 md:gap-3">
                        <img src="/images/artisan-logo.png" alt="Logo" className="w-8 h-8 md:w-12 md:h-12 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="font-brand text-xl md:text-2xl tracking-wider text-accent">
                            AR<span className="text-white">tisan</span>
                        </span>
                    </div>

                    {/* Navigation links & User actions */}
                    <div className="flex items-center gap-3 md:gap-6">
                        <nav className="hidden lg:flex gap-8">
                            <a href="#features" className="text-white/70 hover:text-accent transition-colors text-sm font-medium">Features</a>
                            <a href="#about" className="text-white/70 hover:text-accent transition-colors text-sm font-medium">About</a>
                            <a href="#contact" className="text-white/70 hover:text-accent transition-colors text-sm font-medium">Contact</a>
                        </nav>

                        <div className="flex items-center gap-3 md:gap-4 ml-2 md:ml-4 pl-2 md:pl-4 border-l border-white/10">
                            {user ? (
                                <>
                                    <span className="text-xs md:text-sm text-white/50 hidden md:block">{user.email}</span>
                                    <button onClick={handleLogout} className="group p-2 md:p-0 md:bg-transparent transition-all">
                                        <span className="hidden md:inline text-sm font-medium text-white/80 hover:text-white">Log Out</span>
                                        <LogOut className="w-5 h-5 text-white/80 md:hidden hover:text-accent transition-colors" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-white/80 hover:text-white transition-colors p-2 md:p-0">
                                        <span className="hidden md:inline">Login</span>
                                        <LogIn className="w-5 h-5 md:hidden" />
                                    </Link>
                                    <Link to="/signup" className="flex items-center">
                                        <Button className="px-3! py-1.5! md:px-6! md:py-2! text-xs! md:text-sm! flex items-center gap-2">
                                            <span className="hidden md:inline">Get Started</span>
                                            <UserPlus className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    )
}

export default Navbar
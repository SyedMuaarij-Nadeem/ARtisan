import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

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
            className="fixed top-4 left-1/2 z-50 w-[85%] max-w-7xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-cyan-500/10"
        >
            <div className="mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="shrink-0 flex items-center gap-3">
                        <img src="/images/artisan-logo.png" alt="Logo" className="w-10 h-10 object-contain"
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
        </motion.header>
    )
}

export default Navbar
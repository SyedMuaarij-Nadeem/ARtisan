import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, LayoutDashboard, Box, Plus } from 'lucide-react';
import artisanLogo from '../assets/artisan-logo.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Scroll Logic
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 300) {
            setHidden(true);
            setMobileOpen(false);
        } else {
            setHidden(false);
        }
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileOpen(false);
    };

    return (
        <>
            <motion.header
                initial={{ y: -100, x: "-50%", opacity: 0 }}
                animate={hidden ? { y: -100, x: "-50%", opacity: 0 } : { y: 0, x: "-50%", opacity: 1 }}
                transition={{
                    y: { duration: 0.5, ease: "circOut" },
                    opacity: { duration: 0.4, ease: "linear" }
                }}
                className="fixed top-4 sm:top-6 left-1/2 z-50 w-[95%] sm:w-[92%] md:w-[88%] max-w-7xl rounded-none border-b border-white/5 bg-linear-to-r from-[#0D0D0D]/80 via-[#1A1A1A]/70 to-[#0D0D0D]/80 backdrop-blur-xl shadow-2xl shadow-black/40"
            >
                {/* Subtle Top Shine */}
                <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
                
                {/* Subtle Copper Glow Accent */}
                <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-linear-to-r from-transparent via-[#8B5E3C]/40 to-transparent" />

                <div className="mx-auto px-3 sm:px-5 md:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 lg:h-20">
                        
                        {/* LOGO + TYPOGRAPHIC NAME */}
                        <Link to="/dashboard" className="shrink-0 flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
                            <img src={artisanLogo} alt="ARtisan Logo" className="h-7 sm:h-8 md:h-9 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                            <span className="text-lg sm:text-xl md:text-2xl tracking-[0.3em] sm:tracking-[0.4em] font-light text-white uppercase">
                             AR<span className="text-[#8B5E3C] italic font-serif font-medium">tisan</span>
                            </span>
                        </Link>

                        {/* DESKTOP NAVIGATION */}
                        <div className="hidden lg:flex items-center gap-6 xl:gap-14">
                            <nav className="flex gap-12">
                                <Link to="/image-to-3d" className="text-white/60 hover:text-[#8B5E3C] transition-colors text-[11px] uppercase tracking-[0.5em] font-medium">
                                    Studio
                                </Link>
                                <a href="/#contact" className="text-white/60 hover:text-[#8B5E3C] transition-colors text-[11px] uppercase tracking-[0.5em] font-medium">
                                    Contact
                                </a>
                            </nav>

                            {/* AUTH ACTIONS - DESKTOP */}
                            <div className="flex items-center gap-4 xl:gap-10 pl-6 xl:pl-8 border-l border-white/10">
                                {user ? (
                                    <>
                                        <Link to="/dashboard" className="text-[10px] uppercase tracking-widest text-[#8B5E3C] font-bold hover:text-white transition-colors">
                                            Dashboard
                                        </Link>
                                        <span className="text-[10px] uppercase tracking-widest text-white/30 max-w-[160px] truncate hidden xl:block">
                                            {user.email}
                                        </span>
                                        <button onClick={handleLogout} className="group transition-all text-[11px] uppercase tracking-widest font-medium text-white/80 hover:text-[#8B5E3C]">
                                            Log Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="text-[11px] uppercase tracking-widest font-medium text-white/80 hover:text-[#8B5E3C] transition-colors">
                                            Sign In
                                        </Link>
                                        <Link to="/signup">
                                            <button className="bg-[#8B5E3C] text-white px-6 xl:px-8 py-2.5 text-[9px] xl:text-[11px] uppercase tracking-widest font-medium hover:bg-white hover:text-black transition-all duration-500 shadow-xl">
                                                Get Started
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* MOBILE RIGHT SIDE */}
                        <div className="flex lg:hidden items-center gap-3">
                            {!user && (
                                <Link to="/signup">
                                    <button className="bg-[#8B5E3C] text-white px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] uppercase tracking-widest font-medium hover:bg-white hover:text-black transition-all duration-500 shadow-xl">
                                        Start
                                    </button>
                                </Link>
                            )}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="p-2 text-white/80 hover:text-white transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* MOBILE DRAWER MENU */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="fixed top-[64px] sm:top-[72px] left-1/2 -translate-x-1/2 w-[95%] sm:w-[92%] z-50 lg:hidden bg-[#0D0D0D]/95 backdrop-blur-2xl border border-white/5 shadow-2xl"
                        >
                            <div className="p-5 sm:p-6 space-y-1">
                                {user && (
                                    <div className="pb-4 mb-3 border-b border-white/5">
                                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Signed in as</p>
                                        <p className="text-[11px] text-white/60 mt-1 truncate">{user.email}</p>
                                    </div>
                                )}

                                <MobileNavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setMobileOpen(false)} />
                                <MobileNavLink to="/image-to-3d" icon={Plus} label="Studio" onClick={() => setMobileOpen(false)} />
                                <MobileNavLink to="/assets" icon={Box} label="Asset Library" onClick={() => setMobileOpen(false)} />
                                <a href="/#contact" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-3 py-3 text-[11px] uppercase tracking-[0.3em] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group">
                                    Contact
                                </a>

                                <div className="pt-3 mt-3 border-t border-white/5">
                                    {user ? (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-4 px-3 py-3 text-[11px] uppercase tracking-[0.3em] font-black text-red-400/70 hover:text-red-400 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    ) : (
                                        <>
                                            <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full block text-center py-3.5 mb-2 text-[11px] uppercase tracking-widest font-medium text-white/80 hover:text-[#8B5E3C] border border-white/10 hover:border-[#8B5E3C]/30 transition-all">
                                                Sign In
                                            </Link>
                                            <Link to="/signup" onClick={() => setMobileOpen(false)}>
                                                <button className="w-full bg-[#8B5E3C] text-white py-3.5 text-[11px] uppercase tracking-widest font-medium hover:bg-white hover:text-black transition-all duration-500">
                                                    Get Started
                                                </button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const MobileNavLink = ({ to, icon: Icon, label, onClick }) => (
    <Link to={to} onClick={onClick} className="flex items-center gap-4 px-3 py-3 text-[11px] uppercase tracking-[0.3em] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group">
        <Icon className="w-4 h-4 text-[#8B5E3C]/60 group-hover:text-[#8B5E3C] transition-colors" />
        {label}
    </Link>
);

export default Navbar;
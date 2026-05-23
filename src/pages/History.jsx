import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { ArrowLeft, History as HistoryIcon, Search, Box } from 'lucide-react';
import bgImg from '../assets/hero-bg.jpg';

export default function HistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;
        const fetchHistory = async () => {
            try {
                const hq = query(collection(db, `users/${user.uid}/history`));
                const hSnapshot = await getDocs(hq);
                const historyData = hSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => b.timestamp - a.timestamp);
                setHistory(historyData);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user?.uid]);

    return (
        <div className="flex flex-col h-screen bg-[#0A0A0A] text-[#F4F1EE] font-inter overflow-hidden relative">
            <Navbar />
            
            {/* Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
                <img src={bgImg} className="w-full h-full object-cover" alt="bg" />
            </div>

            {/* Back Button Overlay */}
            <Link 
                to="/dashboard"
                className="fixed top-[100px] sm:top-[110px] md:top-[120px] left-3 sm:left-6 md:left-8 z-50 flex items-center gap-2 sm:gap-3 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#F4F1EE]/80 hover:text-white transition-all group font-bold"
            >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden xs:inline">Back to Dashboard</span>
                <span className="xs:hidden">Back</span>
            </Link>

            <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar mt-[88px]">
                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    <div className="mb-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block mb-6 p-4 border border-white/10 bg-white/5"
                        >
                            <HistoryIcon className="w-8 h-8 text-white/50" />
                        </motion.div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-4">
                            Exploration <span className="italic font-serif text-[#8B5E3C]">Log</span>
                        </h1>
                        <p className="text-[#F4F1EE]/50 text-xs uppercase tracking-[0.4em] font-bold">
                            Your chronological history of loaded assets
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin w-8 h-8 border-t-2 border-[#8B5E3C] border-solid rounded-full" />
                        </div>
                    ) : history.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {history.map((model) => (
                                <Link key={model.id} to="/assets" state={{ model }} className="group">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative aspect-square bg-white/[0.02] border border-white/5 overflow-hidden transition-all group-hover:border-[#8B5E3C]/30"
                                    >
                                        {model.thumbnailUrl ? (
                                            <img src={model.thumbnailUrl} alt={model.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A1A]">
                                                <Box className="w-8 h-8 text-white/10 mb-2" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 flex flex-col justify-end p-4">
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-white truncate w-full mb-1">{model.name}</span>
                                            <span className="text-[8px] uppercase tracking-[0.2em] text-[#8B5E3C]">
                                                {new Date(model.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full py-20 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10 text-center px-4">
                            <Search className="w-12 h-12 text-white/10 mb-6" />
                            <h3 className="text-sm uppercase tracking-widest font-bold text-white/50 mb-2">No History Found</h3>
                            <p className="text-[10px] uppercase tracking-widest text-white/30 max-w-sm">
                                You haven't loaded any assets into the studio viewer yet.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

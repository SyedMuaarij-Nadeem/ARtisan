import { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard,
    Box,
    Plus,
    LogOut,
    Sparkles,
    ArrowUpRight,
    Edit2,
    X,
    Upload,
    User,
    Camera,
    Settings,
    History
} from 'lucide-react';

const PREDEFINED_AVATARS = [
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan1&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan2&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan3&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan4&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan5&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan6&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan7&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan8&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan9&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan10&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan11&backgroundColor=0a0a0a",
    "https://api.dicebear.com/9.x/toon-head/svg?seed=artisan12&backgroundColor=0a0a0a"
];
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import bgImg from '../assets/hero-bg.jpg';
import logoImg from '../assets/artisan-logo.png';

const Dashboard = () => {
    const { user, userProfile, logout, updateProfileData } = useAuth();
    const navigate = useNavigate();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        displayName: '',
        bio: '',
        role: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [recentModels, setRecentModels] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchModelsAndHistory = async () => {
            try {
                // Fetch user generated models
                const q = query(collection(db, `users/${user.uid}/models`));
                const snapshot = await getDocs(q);
                const modelData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setModels(modelData);

                // Fetch recent search history
                const hq = query(collection(db, `users/${user.uid}/history`));
                const hSnapshot = await getDocs(hq);
                const historyData = hSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
                setRecentModels(historyData);

            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchModelsAndHistory();
    }, [user?.uid]);

    // Open Modal and populate data
    const openEditModal = () => {
        setEditData({
            displayName: userProfile?.displayName || user?.displayName || '',
            bio: userProfile?.bio || '',
            role: userProfile?.role || 'Common User'
        });
        setImagePreview(userProfile?.photoURL || user?.photoURL || null);
        setSelectedAvatarUrl(userProfile?.photoURL || user?.photoURL || null);
        setImageFile(null);
        setSaveError(null);
        setIsEditModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setSelectedAvatarUrl(null); // Clear predefined if custom is uploaded
        }
    };

    const handleAvatarSelect = (url) => {
        setSelectedAvatarUrl(url);
        setImagePreview(url);
        setImageFile(null); // Clear custom upload if predefined is selected
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            await updateProfileData(editData, imageFile, selectedAvatarUrl);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            setSaveError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0A0A0A] text-[#F4F1EE] font-inter overflow-hidden relative">

            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <img src={bgImg} className="w-full h-full object-cover brightness-[0.25] contrast-[1.2]" alt="Background" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0D0D0D] via-transparent to-[#0D0D0D]/80" />
            </div>

            {/* SIDEBAR - desktop only */}
            <aside className="relative z-20 w-56 lg:w-64 border-r border-white/5 bg-[#0D0D0D]/80 backdrop-blur-3xl flex-col p-6 lg:p-8 hidden md:flex shrink-0">
                <div className="mb-10 xl:mb-20">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logoImg} alt="Logo" className="w-8 h-8 opacity-80" />
                        <span className="text-xl xl:text-2xl tracking-[0.4em] uppercase font-light drop-shadow-2xl">
                            AR<span className="italic font-serif text-[#8B5E3C]">tisan</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-6 xl:space-y-10">
                    <div className="space-y-3 xl:space-y-4">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#F4F1EE]/70 font-black px-3">Studio</p>
                        <div className="space-y-1 xl:space-y-2">
                            <NavItem icon={LayoutDashboard} label="Overview" active />
                            <Link to="/image-to-3d"><NavItem icon={Plus} label="New Design" /></Link>
                        </div>
                    </div>

                    <div className="space-y-3 xl:space-y-4">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#F4F1EE]/70 font-black px-3">Library</p>
                        <div className="space-y-1 xl:space-y-2">
                            <Link to="/assets"><NavItem icon={Box} label="All Assets" /></Link>
                        </div>
                    </div>

                    <div className="space-y-3 xl:space-y-4">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#F4F1EE]/70 font-black px-3">System</p>
                        <div className="space-y-1 xl:space-y-2">
                            <Link to="/history">
                                <NavItem icon={History} label="Exploration History" />
                            </Link>
                            <button onClick={openEditModal} className="w-full text-left">
                                <NavItem icon={Settings} label="Profile Settings" />
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="mt-auto pt-8">
                    <button onClick={logout} className="w-full text-left">
                        <NavItem icon={LogOut} label="Exit Studio" color="text-red-500/50" />
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0 custom-scrollbar relative min-w-0 z-10">
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-10">

                    {/* Header & Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-6 sm:p-8 md:p-10 overflow-hidden bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* High-Intensity Gradients */}
                        <div className="absolute top-0 right-0 w-48 h-48 sm:w-[300px] sm:h-[300px] xl:w-[600px] xl:h-[600px] bg-[#8B5E3C]/30 blur-[60px] sm:blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 xl:w-80 xl:h-80 bg-[#8B5E3C]/10 blur-[60px] sm:blur-[80px] rounded-full" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-6 sm:gap-8">
                                {/* Profile Avatar */}
                                <div className="relative group shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 border-[#8B5E3C]/50 shadow-[0_0_30px_rgba(139,94,60,0.3)] bg-black/50">
                                        {(userProfile?.photoURL || user?.photoURL) ? (
                                            <img src={userProfile?.photoURL || user?.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                                                <User className="w-10 h-10 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center sm:text-left flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2 sm:mb-4">
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white truncate max-w-full pb-1 leading-normal">
                                            {userProfile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Studio Member')}
                                        </h1>
                                        <span className="px-3 py-1 bg-[#8B5E3C]/20 border border-[#8B5E3C]/50 text-[9px] uppercase tracking-widest text-[#8B5E3C] font-black">
                                            {userProfile?.role || 'Common User'}
                                        </span>
                                    </div>

                                    <p className="text-white/50 text-sm max-w-md mb-4 font-light italic">
                                        {userProfile?.bio ? `"${userProfile.bio}"` : "Add a bio to express your creative vision."}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6">
                                        <p className="text-[#F4F1EE]/60 text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-bold">
                                            Studio Control • {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-[#8B5E3C]/80 font-black">
                                            <Sparkles className="w-2.5 h-2.5" /> Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link to="/image-to-3d" className="w-full sm:w-auto bg-[#8B5E3C] text-white px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white hover:text-black transition-all duration-500 flex items-center justify-center gap-3 group shrink-0 shadow-[0_10px_30px_rgba(139,94,60,0.3)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.2)]">
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                                Start Studio
                            </Link>
                        </div>
                    </motion.div>

                    {/* METRICS & STATS SECTION */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-4 sm:p-6 flex flex-col justify-center items-center sm:items-start transition-all hover:bg-white/[0.04]">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1 sm:mb-2">Total Assets</span>
                            <span className="text-2xl sm:text-3xl font-light text-white">{models.length}</span>
                        </div>
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-4 sm:p-6 flex flex-col justify-center items-center sm:items-start transition-all hover:bg-white/[0.04]">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1 sm:mb-2">Role Status</span>
                            <span className="text-base sm:text-lg font-light text-[#8B5E3C] truncate max-w-full">{userProfile?.role || 'User'}</span>
                        </div>
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-4 sm:p-6 flex flex-col justify-center items-center sm:items-start transition-all hover:bg-white/[0.04]">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1 sm:mb-2">Network</span>
                            <span className="text-base sm:text-lg font-light text-white">Connected</span>
                        </div>
                        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-4 sm:p-6 flex flex-col justify-center items-center sm:items-start transition-all hover:bg-white/[0.04]">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1 sm:mb-2">Last Sync</span>
                            <span className="text-base sm:text-lg font-light text-white">Just Now</span>
                        </div>
                    </div>

                    {/* CREATION SUITE */}
                    <section className="pb-12">
                        <div className="flex items-center gap-4 mb-8 sm:mb-10">
                            <h2 className="text-[10px] font-black tracking-[0.6em] uppercase text-white/50">Creation Suite</h2>
                            <div className="flex-1 h-[1px] bg-white/[0.05]" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                            <Link to="/image-to-3d" className="group">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="relative h-40 sm:h-48 md:h-56 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 sm:p-6 md:p-8 flex flex-col justify-between transition-all group-hover:border-[#8B5E3C]/50 group-hover:shadow-[0_20px_50px_rgba(139,94,60,0.15)] overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5E3C]/10 blur-[40px] rounded-full group-hover:bg-[#8B5E3C]/20 transition-all duration-500" />

                                    <div className="relative z-10">
                                        <div className="bg-[#8B5E3C]/10 w-12 h-12 flex items-center justify-center mb-6 text-[#8B5E3C]">
                                            <Box className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-base sm:text-lg lg:text-xl font-light tracking-widest uppercase text-white">Image to <span className="italic font-serif text-[#8B5E3C]">3D</span></h3>
                                        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] leading-relaxed max-w-[240px] font-bold mt-3">
                                            Neural spatial reconstruction via Artisan Engine.
                                        </p>
                                    </div>
                                    <div className="relative z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] font-black text-[#8B5E3C] group-hover:text-white transition-colors">
                                        Initialize <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            </Link>

                            <Link to="/text-to-3d" className="group">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="relative h-40 sm:h-48 md:h-56 bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 sm:p-6 md:p-8 flex flex-col justify-between transition-all group-hover:border-[#8B5E3C]/50 group-hover:shadow-[0_20px_50px_rgba(139,94,60,0.15)] overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5E3C]/10 blur-[40px] rounded-full group-hover:bg-[#8B5E3C]/20 transition-all duration-500" />

                                    <div className="relative z-10">
                                        <div className="bg-[#8B5E3C]/10 w-12 h-12 flex items-center justify-center mb-6 text-[#8B5E3C]">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-base sm:text-lg lg:text-xl font-light tracking-widest uppercase text-white">Text to <span className="italic font-serif text-[#8B5E3C]">3D</span></h3>
                                        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] leading-relaxed max-w-[240px] font-bold mt-3">
                                            AI-driven neural sculpting from descriptive prompts.
                                        </p>
                                    </div>
                                    <div className="relative z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] font-black text-[#8B5E3C] group-hover:text-white transition-colors">
                                        Initialize <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </section>

                    {/* RECENT EXPLORATIONS */}
                    <section className="pb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-[10px] font-black tracking-[0.6em] uppercase text-white/50">Recent Explorations</h2>
                            <div className="flex-1 h-[1px] bg-white/[0.05]" />
                            <Link to="/history" className="text-[9px] uppercase tracking-widest text-[#8B5E3C] hover:text-white transition-colors font-bold">
                                Show All
                            </Link>
                        </div>
                        {recentModels.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recentModels.map(model => (
                                    <Link key={model.id} to="/assets" state={{ model }} className="group">
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className="relative aspect-square bg-white/[0.02] border border-white/5 overflow-hidden transition-all group-hover:border-[#8B5E3C]/30"
                                        >
                                            {model.thumbnailUrl ? (
                                                <img src={model.thumbnailUrl} alt={model.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A1A]">
                                                    <History className="w-8 h-8 text-white/10 mb-2" />
                                                    <span className="text-[8px] uppercase tracking-widest text-white/20">No Preview</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-white truncate w-full">{model.name}</span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full py-12 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10">
                                <History className="w-8 h-8 text-white/10 mb-4" />
                                <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">No recent explorations found.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* EDIT PROFILE MODAL */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-lg bg-[#121212] border border-white/10 p-5 sm:p-7 rounded-none shadow-2xl z-50 overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-light tracking-widest uppercase">Edit <span className="italic font-serif text-[#8B5E3C]">Profile</span></h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Avatar Selection */}
                                <div className="flex flex-col items-center">
                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/40 mb-4 w-full text-center">Select an Avatar</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4 w-full">
                                        {PREDEFINED_AVATARS.map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAvatarSelect(url)}
                                                className={`aspect-square border-2 transition-all overflow-hidden bg-[#1A1A1A]
                                                    ${selectedAvatarUrl === url ? 'border-[#8B5E3C] shadow-[0_0_20px_rgba(139,94,60,0.4)] scale-105' : 'border-white/10 hover:border-white/30'}`}
                                            >
                                                <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {saveError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-none font-bold">
                                        {saveError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={editData.displayName}
                                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-none text-sm text-white focus:outline-none focus:border-[#8B5E3C] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Role</label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-[#8B5E3C] transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Common User">Common User</option>
                                        <option value="Designer">Designer</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 ml-1">Bio</label>
                                    <textarea
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        rows="3"
                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-[#8B5E3C] transition-all resize-none"
                                        placeholder="Tell us about your creative vision..."
                                    />
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="w-full bg-[#8B5E3C] text-white py-4 rounded-xl text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white hover:text-black transition-all shadow-xl mt-4 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* MOBILE NAVIGATION BAR */}
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D0D0D]/95 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center z-40"
                style={{
                    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
                    paddingTop: '16px',
                    paddingLeft: 'max(20px, env(safe-area-inset-left))',
                    paddingRight: 'max(20px, env(safe-area-inset-right))'
                }}
            >
                <Link to="/dashboard" className="flex flex-col items-center gap-1">
                    <LayoutDashboard className="w-5 h-5 text-[#8B5E3C]" />
                    <span className="text-[8px] uppercase tracking-widest text-[#8B5E3C]/60 font-bold">Home</span>
                </Link>
                <Link to="/image-to-3d" className="flex flex-col items-center gap-1">
                    <Plus className="w-5 h-5 text-[#F4F1EE]/70" />
                    <span className="text-[8px] uppercase tracking-widest text-[#F4F1EE]/30 font-bold">Studio</span>
                </Link>
                <Link to="/assets" className="flex flex-col items-center gap-1">
                    <Box className="w-5 h-5 text-[#F4F1EE]/70" />
                    <span className="text-[8px] uppercase tracking-widest text-[#F4F1EE]/30 font-bold">Assets</span>
                </Link>
                <button onClick={openEditModal} className="flex flex-col items-center gap-1">
                    <Settings className="w-5 h-5 text-[#F4F1EE]/70" />
                    <span className="text-[8px] uppercase tracking-widest text-[#F4F1EE]/30 font-bold">Profile</span>
                </button>
            </div>
        </div>
    );
};

const NavItem = ({ icon: Icon, label, active = false, color = "text-[#F4F1EE]/70" }) => (
    <div className={`flex items-center gap-3 xl:gap-5 cursor-pointer group transition-all px-3 py-2 ${active ? 'text-[#F4F1EE]' : color} hover:text-[#F4F1EE] relative`}>
        <div className={`transition-all ${active ? 'text-[#8B5E3C]' : 'group-hover:text-[#8B5E3C]'}`}>
            <Icon className={`w-4 h-4 transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        </div>
        <span className={`text-[9px] uppercase tracking-[0.2em] transition-all duration-500 ${active ? 'font-bold translate-x-1' : 'font-light group-hover:translate-x-1 group-hover:font-medium'}`}>{label}</span>

        {active && (
            <motion.div
                layoutId="activeNav"
                className="absolute left-[-32px] w-1 h-6 bg-[#8B5E3C] shadow-[0_0_15px_rgba(139,94,60,0.4)]"
            />
        )}
    </div>
);

export default Dashboard;

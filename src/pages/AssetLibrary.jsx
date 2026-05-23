import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/AssetLibrary/Sidebar';
import ModelViewer from '../components/AssetLibrary/ModelViewer';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AssetLibrary() {
  const location = useLocation();
  const [selectedModel, setSelectedModel] = useState(location.state?.model || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(location.state?.model ? false : true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let wasMobile = window.innerWidth < 1024;
    
    // Initial load
    setIsMobile(wasMobile);
    setIsSidebarOpen(!wasMobile);

    const checkMobile = () => {
      const isNowMobile = window.innerWidth < 1024;
      
      // Only trigger state changes if the breakpoint is crossed
      if (isNowMobile !== wasMobile) {
        setIsMobile(isNowMobile);
        setIsSidebarOpen(!isNowMobile);
        wasMobile = isNowMobile;
      }
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { user } = useAuth();

  const handleModelSelect = async (model) => {
    setSelectedModel(model);
    if (isMobile) setIsSidebarOpen(false);

    // Log to history
    if (user?.uid && model) {
      try {
        const historyRef = doc(db, `users/${user.uid}/history/${model.uid || model.id || Date.now()}`);
        await setDoc(historyRef, {
          id: model.uid || model.id || Date.now().toString(),
          uid: model.uid || model.id || null,
          name: model.name || 'Untitled Model',
          thumbnailUrl: model.thumbnailUrl || model.thumbnail || null,
          isLocal: model.isLocal || false,
          meshUrl: model.meshUrl || null,
          timestamp: Date.now()
        }, { merge: true });
      } catch (err) {
        console.error("Failed to save history:", err);
      }
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-[#0A0A0A] text-white font-inter overflow-hidden relative">
      <Navbar />
      
      <div className="flex flex-1 relative overflow-hidden" style={{ marginTop: 'clamp(68px, 8vw, 88px)' }}>
        
        {/* Sidebar Container */}
        <aside 
          className={`shrink-0 border-r border-white/5 bg-[#0D0D0D] transition-all duration-500 overflow-hidden relative z-40
            ${isSidebarOpen ? 'w-full lg:w-[300px] xl:w-[320px]' : 'w-0'}
          `}
        >
          <div className="w-full lg:w-[300px] xl:w-[320px] h-full relative">
            <Sidebar 
              onSelectModel={handleModelSelect} 
              selectedModel={selectedModel} 
              onClose={() => setIsSidebarOpen(false)}
              isMobile={isMobile}
            />
          </div>
          {/* Sidebar Collapse Tab */}
          {isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-[30%] -right-6 bg-[#8B5E3C] w-6 h-12 flex items-center justify-center text-white z-50 hover:bg-white hover:text-black transition-all rounded-r-lg shadow-lg"
              title="Collapse Panel"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 relative h-full flex flex-col overflow-hidden">
            {/* Open Panel Tab */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    title="Open Panel"
                    className="absolute left-0 top-[30%] z-50 bg-[#8B5E3C] w-6 h-12 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all rounded-r-lg shadow-lg"
                >
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                </button>
            )}
          {selectedModel ? (
            <div className="w-full h-full relative">
                {/* Mobile Toggle inside viewer when sidebar hidden */}
                {!isSidebarOpen && (
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="absolute top-8 left-8 z-50 px-6 py-3 bg-[#0D0D0D] border border-white/10 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#8B5E3C] transition-all flex items-center gap-3 shadow-2xl"
                    >
                        <Boxes className="w-4 h-4 text-[#8B5E3C]" />
                        Library
                    </button>
                )}
                <ModelViewer 
                  modelUid={!selectedModel.isLocal ? (selectedModel.uid || selectedModel.id) : null} 
                  url={selectedModel.isLocal ? selectedModel.meshUrl : null} 
                />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-[#0A0A0A] relative">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #8B5E3C 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-6 border border-[#8B5E3C]/20 bg-[#8B5E3C]/5"
                >
                    <Boxes className="w-10 h-10 text-[#8B5E3C]" />
                </motion.div>
                
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-light tracking-tight mb-4 sm:mb-6">
                    Library <span className="italic font-serif text-[#8B5E3C]">Explorer</span>
                </h2>
                <p className="text-[#F4F1EE]/70 text-xs sm:text-sm uppercase tracking-[0.4em] font-medium leading-loose max-w-lg mx-auto mb-10">
                    Select a curated asset from the collection to preview in high-fidelity 3D space.
                </p>
                
                {!isSidebarOpen && (
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="px-12 py-5 bg-[#8B5E3C] text-white text-xs uppercase tracking-[0.5em] font-black hover:bg-white hover:text-black transition-all shadow-2xl"
                    >
                        Open Collection
                    </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

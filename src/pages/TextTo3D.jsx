import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ModelViewer from '../components/AssetLibrary/ModelViewer';
import PromptSidebar from '../components/TextTo3D/PromptSidebar';
import { motion } from 'framer-motion';
import { useTextTo3D } from '../hooks/useTextTo3D';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TextTo3D() {
  const { user } = useAuth();
  const { generate, status, meshUrl, error, progress, reset } = useTextTo3D();
  const [promptData, setPromptData] = useState('');

  // Sidebar state
  const isBrowser = typeof window !== 'undefined';
  const [isMobile, setIsMobile] = useState(isBrowser ? window.innerWidth < 768 : false);
  const [sidebarWidth, setSidebarWidth] = useState(isBrowser && window.innerWidth < 768 ? window.innerWidth : 400);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    let wasMobile = window.innerWidth < 768;
    setIsMobile(wasMobile);
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== wasMobile) {
          setIsMobile(mobile);
          wasMobile = mobile;
          if (mobile) setSidebarWidth(window.innerWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save to Firestore when done
  useEffect(() => {
    if (status === 'done' && meshUrl && user?.uid && promptData) {
      const saveModel = async () => {
        try {
          await addDoc(collection(db, `users/${user.uid}/models`), {
            name: `Generated Model ${new Date().toLocaleTimeString()}`,
            meshUrl,
            prompt: promptData,
            thumbnail: null, // Text to 3D doesn't have an input image to use as thumbnail
            createdAt: serverTimestamp(),
            type: 'AI Generated (Text)'
          });
          console.log("Model saved to user library");
        } catch (e) {
          console.error("Error saving model:", e);
        }
      };
      saveModel();
    }
  }, [status, meshUrl, user?.uid, promptData]);

  const handleGenerate = (prompt, options) => {
    setPromptData(prompt);
    generate(prompt, options);
    if (isMobile) setIsSidebarOpen(false);
  };

  function handleReset() {
    reset();
    setPromptData('');
    setIsSidebarOpen(true);
  }

  return (
    <div className="flex flex-col h-dvh bg-[#0A0A0A] text-[#F4F1EE] font-inter overflow-hidden relative">
      <Navbar />
      
      <div className="flex-1 relative flex overflow-hidden" style={{ marginTop: 'clamp(68px, 8vw, 88px)' }}>
        
        {/* SIDEBAR */}
        <div 
          className={`shrink-0 border-r border-white/5 bg-[#0D0D0D] transition-all duration-500 overflow-hidden relative z-40
            ${isSidebarOpen ? 'w-full md:w-[300px] lg:w-[320px] xl:w-[340px]' : 'w-0'}
          `}
        >
          <div className="w-full md:w-[300px] lg:w-[320px] xl:w-[340px] h-full flex flex-col relative">
            <PromptSidebar 
              status={status}
              progress={progress}
              error={error}
              meshUrl={meshUrl}
              onGenerate={handleGenerate}
              onReset={handleReset}
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
        </div>

        {/* VIEWER AREA */}
        <div 
            className="flex-1 relative bg-[#0A0A0A] transition-all duration-500 overflow-hidden"
        >
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

            {/* Note: The viewer might crash if passed an invalid meshUrl. 
                For the simulation, we'll only show the viewer if meshUrl is not "placeholder_model_url".
                If you have a real fallback GLB, you'd use that.
            */}
            {meshUrl && meshUrl !== 'placeholder_model_url' ? (
                <ModelViewer url={meshUrl} />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="max-w-2xl text-center">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-32 h-32 border border-dashed border-[#8B5E3C]/20 rounded-full mx-auto mb-12 flex items-center justify-center"
                        >
                            <Sparkles className="w-8 h-8 text-[#8B5E3C]/30" />
                        </motion.div>
                        
                        {status === 'generating' || status === 'connecting' ? (
                            <div className="space-y-6 sm:space-y-8 w-full max-w-md mx-auto px-4 sm:px-0">
                                <h2 className="text-xl sm:text-3xl md:text-5xl font-light tracking-widest uppercase">Sculpting <span className="italic font-serif text-[#8B5E3C]">Reality</span></h2>
                                <p className="text-white/80 text-xs uppercase tracking-[0.6em] animate-pulse font-bold">Neural Reconstruction in Progress...</p>
                                
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 sm:pt-8 w-full">
                                    <div className="flex justify-between text-[10px] sm:text-xs text-white/70 font-bold uppercase tracking-[0.4em]">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-[2px] bg-white/10 overflow-hidden rounded-full relative">
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-[#8B5E3C] shadow-[0_0_15px_rgba(139,94,60,0.5)]"
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </motion.div>
                            </div>
                        ) : status === 'done' ? (
                            <div className="space-y-6 sm:space-y-8">
                                <h2 className="text-2xl sm:text-4xl md:text-6xl font-light tracking-tight">Generation <span className="italic font-serif text-[#8B5E3C]">Complete</span></h2>
                                <p className="text-[#F4F1EE]/80 text-sm sm:text-base font-light leading-relaxed max-w-lg mx-auto">
                                    The simulated 3D model generation has finished successfully. Check your library.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 sm:space-y-8">
                                <h2 className="text-2xl sm:text-4xl md:text-6xl font-light tracking-tight">Text Engine <span className="italic font-serif text-[#8B5E3C]">Awaiting Input</span></h2>
                                <p className="text-[#F4F1EE]/80 text-sm sm:text-base font-light leading-relaxed max-w-lg mx-auto">
                                    Provide a descriptive prompt to generate a highly detailed 3D model using AI.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

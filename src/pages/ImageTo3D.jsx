import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ModelViewer from '../components/AssetLibrary/ModelViewer';
import UploadSidebar from '../components/ImageTo3D/UploadSidebar';
import { motion } from 'framer-motion';
import { useHunyuan3D } from '../hooks/useHunyuan3D';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ImageTo3D() {
  const { user } = useAuth();
  const { generate, status, meshUrl, error, progress, reset } = useHunyuan3D();
  const [preview, setPreview] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  // Sidebar state
  const isBrowser = typeof window !== 'undefined';
  const [isMobile, setIsMobile] = useState(isBrowser ? window.innerWidth < 768 : false);
  const [sidebarWidth, setSidebarWidth] = useState(isBrowser && window.innerWidth < 768 ? window.innerWidth : 400);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save to Firestore when done
  useEffect(() => {
    if (status === 'done' && meshUrl && user?.uid) {
      const saveModel = async () => {
        try {
          let thumbnailUrl = null;
          if (sourceFile) {
            try {
              const storageRef = ref(storage, `thumbnails/${user.uid}/${Date.now()}_${sourceFile.name}`);
              const snapshot = await uploadBytes(storageRef, sourceFile);
              thumbnailUrl = await getDownloadURL(snapshot.ref);
            } catch (storageErr) {
              console.error("Storage error:", storageErr);
            }
          }

          await addDoc(collection(db, `users/${user.uid}/models`), {
            name: `Generated Model ${new Date().toLocaleTimeString()}`,
            meshUrl,
            thumbnail: thumbnailUrl,
            createdAt: serverTimestamp(),
            type: 'AI Generated'
          });
          console.log("Model saved to user library with thumbnail");
        } catch (e) {
          console.error("Error saving model:", e);
        }
      };
      saveModel();
    }
  }, [status, meshUrl, user?.uid, sourceFile]);

  const handleFile = (file, qualityOptions = {}) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    setSourceFile(file);
    generate(file, qualityOptions);
    if (isMobile) setIsSidebarOpen(false);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  function handleReset() {
    reset();
    setPreview(null);
    setSourceFile(null);
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
            <UploadSidebar 
              preview={preview}
              status={status}
              progress={progress}
              error={error}
              meshUrl={meshUrl}
              onFileSelect={handleFile}
              onReset={handleReset}
              inputRef={inputRef}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onDrop={onDrop}
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

            {meshUrl ? (
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
                        ) : (
                            <div className="space-y-6 sm:space-y-8">
                                <h2 className="text-2xl sm:text-4xl md:text-6xl font-light tracking-tight">Studio <span className="italic font-serif text-[#8B5E3C]">Awaiting Input</span></h2>
                                <p className="text-[#F4F1EE]/80 text-sm sm:text-base font-light leading-relaxed max-w-lg mx-auto">
                                    Upload a high-fidelity image to begin the AI-driven 3D reconstruction process.
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

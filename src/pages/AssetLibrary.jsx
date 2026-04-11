import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/AssetLibrary/Sidebar';
import ModelViewer from '../components/AssetLibrary/ModelViewer';
import { Library } from 'lucide-react';

export default function AssetLibrary() {
  const [selectedModel, setSelectedModel] = useState(null);

  // Responsive state
  const isBrowser = typeof window !== 'undefined';
  const [isMobile, setIsMobile] = useState(isBrowser ? window.innerWidth < 768 : false);
  
  // Resizable & Collapsible sidebar logic
  const [sidebarWidth, setSidebarWidth] = useState(isBrowser && window.innerWidth < 768 ? window.innerWidth : 360);
  const [isSidebarOpen, setIsSidebarOpen] = useState(isBrowser ? window.innerWidth >= 768 : true);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarWidth(window.innerWidth);
      } else {
        // If transitioning from mobile to desktop, reset to a sane default if it was full screen
        setSidebarWidth(prev => prev >= window.innerWidth ? 360 : prev);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current || isMobile) return;
      const newWidth = Math.max(300, Math.min(e.clientX, 800));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMobile]);

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    // Auto-close on mobile when selecting a model so they can instantly see it
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white font-poppins overflow-hidden">
      <Navbar />
      
      <div className="flex-1 relative w-full h-full overflow-hidden" style={{ marginTop: '72px' }}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute left-4 top-4 z-50 p-2.5 rounded-xl border transition-all backdrop-blur-xl flex items-center justify-center 
            ${isSidebarOpen 
              ? 'bg-[#00f5ff]/10 border-[#00f5ff]/40 text-[#00f5ff] shadow-[0_0_15px_rgba(0,245,255,0.2)]' 
              : 'bg-[#0b0f1a]/80 border-white/10 text-white/60 hover:text-[#00f5ff] hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
            }`}
          title={isSidebarOpen ? "Close library" : "Open library"}
        >
          <Library className="w-5 h-5" />
        </button>

        {/* Resizable Sidebar Container (OVERLAY) */}
        <div 
          className="absolute left-0 top-0 bottom-0 shrink-0 border-r border-[#00f5ff]/20 z-40 transition-[width] duration-300 ease-in-out bg-[#0b0f1a]/95 backdrop-blur-3xl shadow-[5px_0_30px_rgba(0,245,255,0.05)]"
          style={{ width: isSidebarOpen ? (isMobile ? '100%' : `${sidebarWidth}px`) : '0px' }}
        >
          {/* Inner fixed-width container prevents squishing during animation */}
          <div className="absolute inset-0 overflow-hidden h-full">
            <div 
              style={{ width: isMobile ? '100%' : `${sidebarWidth}px` }} 
              className="flex flex-col h-full bg-transparent"
            >
              <Sidebar onSelectModel={handleModelSelect} selectedModel={selectedModel} />
            </div>
          </div>

          {/* Drag Resizer Handle (Hidden on Mobile) */}
          {isSidebarOpen && !isMobile && (
            <div 
              className="absolute right-[-3px] top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#00f5ff]/50 active:bg-[#00f5ff] transition-colors z-50"
              onMouseDown={(e) => {
                isResizing.current = true;
                document.body.style.cursor = 'col-resize';
                e.preventDefault();
              }}
            />
          )}
        </div>

        {/* Viewer */}
        <div className="absolute inset-0 w-full h-full bg-linear-to-br from-[#020617] to-[#0b0f1a]">
          {selectedModel ? (
             <ModelViewer modelUid={selectedModel.uid} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
              <div className="text-white/20 text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 border border-dashed border-[#00f5ff]/20 rounded-full animate-[spin_20s_linear_infinite] mx-auto mb-6 flex items-center justify-center">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 border border-dashed border-[#00f5ff]/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                </div>
                <p className="font-light italic text-base sm:text-lg tracking-wide">Select an asset from the library</p>
                <p className="text-xs sm:text-sm mt-2 opacity-50">To view in responsive 3D space</p>
                
                {/* Mobile helper prompt */}
                {isMobile && !isSidebarOpen && (
                   <p className="text-[#00f5ff]/70 text-xs mt-8 bg-[#00f5ff]/10 py-2 px-4 rounded-full inline-block border border-[#00f5ff]/20">
                     Tap the library icon to browse
                   </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

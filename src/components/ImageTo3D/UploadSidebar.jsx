import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Download, RotateCcw, ImagePlus, AlertCircle, Zap, Box, Layers, Settings2, ChevronDown, Wand2, Scissors, Cpu, Hash, RefreshCcw, Activity, Maximize, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABEL = {
  idle: 'Upload an image to generate a 3D model',
  connecting: 'Connecting to AI engine…',
  generating: 'Generating 3D model (~45-90s)…',
  done: 'Done! Drag to orbit, scroll to zoom.',
  error: 'Generation failed.',
};

const QUALITY_MODES = {
  fast: { label: 'Fast', icon: Zap, steps: 15, resolution: 128, desc: 'Quick preview, lower detail' },
  balanced: { label: 'Balanced', icon: Box, steps: 20, resolution: 192, desc: 'Good balance of speed & quality' },
  high: { label: 'High', icon: Layers, steps: 30, resolution: 256, desc: 'Maximum detail, slower generation' },
};

export default function UploadSidebar({
  preview,
  status,
  progress,
  error,
  meshUrl,
  onFileSelect,
  onReset,
  inputRef,
  isDragging,
  setIsDragging,
  onDrop
}) {
  const [quality, setQuality] = useState('balanced');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Settings State (Synced with Old Code)
  const [creativity, setCreativity] = useState(5); // Guidance Scale
  const [autoClean, setAutoClean] = useState(true); // Remove Background
  const [detailLevel, setDetailLevel] = useState(8000); // Num Chunks (4000, 8000, 12000)
  
  // Extended Tuning (Engine Parity)
  const [seed, setSeed] = useState(1234);
  const [randomizeSeed, setRandomizeSeed] = useState(true);
  const [manualSteps, setManualSteps] = useState(null); 
  const [manualResolution, setManualResolution] = useState(null);

  const isBusy = status === 'connecting' || status === 'generating';

  const getEngineOptions = () => ({
    steps: manualSteps ?? QUALITY_MODES[quality].steps,
    octreeResolution: manualResolution ?? QUALITY_MODES[quality].resolution,
    guidanceScale: creativity,
    removeBackground: autoClean,
    numChunks: detailLevel,
    seed: seed,
    randomizeSeed: randomizeSeed
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#0D0D0D]">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 pb-4 border-b border-white/5 shrink-0 bg-[#0D0D0D]">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#F4F1EE]/40 hover:text-[#8B5E3C] transition-colors group mb-4"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Exit to Dashboard
        </Link>
        <h2 className="text-base sm:text-xl font-light tracking-[0.3em] uppercase mb-1">
          Studio <span className="text-[#8B5E3C] italic font-serif">Engine</span>
        </h2>
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-medium">Hunyuan3D Neural Suite</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar">

        {/* Step 1: Quality Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-full border border-[#8B5E3C]/30 flex items-center justify-center text-[8px] font-normal text-[#8B5E3C]">1</div>
             <h3 className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">Select Quality</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(QUALITY_MODES).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => {
                  if (!isBusy) {
                    setQuality(key);
                    setManualSteps(null);
                    setManualResolution(null);
                  }
                }}
                className={`flex flex-col items-center gap-3 py-6 px-2 border transition-all 
                  ${quality === key && !manualSteps && !manualResolution
                    ? 'bg-[#8B5E3C]/10 border-[#8B5E3C] text-white shadow-[0_0_20px_rgba(139,94,60,0.1)]' 
                    : 'bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20'
                  } ${isBusy ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <mode.icon className={`w-5 h-5 mb-1 ${quality === key ? 'text-[#8B5E3C]' : 'text-white/20'}`} />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-normal uppercase tracking-widest">{mode.label}</span>
                  <span className="text-[6px] uppercase tracking-[0.2em] opacity-40 mt-1 max-w-[70px] leading-tight text-center">{mode.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="space-y-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full p-4 bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all group"
          >
            <div className="flex items-center gap-3">
              <Settings2 className={`w-4 h-4 transition-transform duration-500 ${showAdvanced ? 'rotate-90 text-[#8B5E3C]' : 'text-white/60'}`} />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 group-hover:text-white font-normal">Advanced Studio Settings</span>
            </div>
            <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-10 pt-4 pb-4 border-b border-white/5"
              >
                {/* AI Creativity (Guidance Scale) - Merged Range 1-15 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-normal flex items-center gap-2">
                      <Wand2 className="w-3 h-3 text-[#8B5E3C]" /> AI Creativity
                    </label>
                    <span className="text-[10px] text-[#8B5E3C] font-mono font-medium">{creativity}</span>
                  </div>
                  <input
                    type="range" min="1" max="15" step="1"
                    value={creativity}
                    onChange={(e) => setCreativity(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#8B5E3C]"
                  />
                  <p className="text-[8px] text-white/20 uppercase tracking-widest italic">Higher = More creative, Lower = More accurate to image</p>
                </div>

                {/* Model Detail (Merged Button selection) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-[#8B5E3C]" />
                        <label className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-normal">Model Detail Level</label>
                    </div>
                    <div className="flex gap-2">
                        {[4000, 8000, 12000].map(val => (
                          <button
                            key={val}
                            onClick={() => setDetailLevel(val)}
                            className={`flex-1 py-3 border transition-all text-[10px] font-medium tracking-widest
                              ${detailLevel === val 
                                ? 'bg-[#8B5E3C]/20 border-[#8B5E3C] text-[#8B5E3C]' 
                                : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10'}
                            `}
                          >
                            {val === 4000 ? 'LOW' : val === 8000 ? 'MED' : 'MAX'}
                          </button>
                        ))}
                    </div>
                </div>

                {/* Remove Background Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white flex items-center gap-2">
                            <Scissors className="w-3 h-3 text-[#8B5E3C]" /> Remove Background
                        </p>
                    </div>
                    <button
                        onClick={() => setAutoClean(!autoClean)}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${autoClean ? 'bg-[#8B5E3C]' : 'bg-white/10'}`}
                    >
                        <motion.div
                            animate={{ x: autoClean ? 22 : 2 }}
                            className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                        />
                    </button>
                </div>

                {/* Extended Tuning Section (Engine Parity) */}
                <div className="space-y-6 pt-4 border-t border-white/[0.02]">
                    <p className="text-[8px] uppercase tracking-[0.5em] text-white/10 font-medium">Extended Engine Tuning</p>
                    
                    {/* Seed Control */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-normal flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Neural Seed
                            </label>
                            <div className="flex items-center gap-3">
                                <span className="text-[8px] uppercase tracking-widest text-white/20">Randomize</span>
                                <button
                                    onClick={() => setRandomizeSeed(!randomizeSeed)}
                                    className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${randomizeSeed ? 'bg-[#8B5E3C]' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        animate={{ x: randomizeSeed ? 18 : 2 }}
                                        className="absolute top-1 left-0 w-2 h-2 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>
                        </div>
                        {!randomizeSeed && (
                            <input
                                type="number"
                                value={seed}
                                onChange={(e) => setSeed(parseInt(e.target.value))}
                                className="w-full bg-white/[0.02] border border-white/5 p-4 text-[10px] font-mono text-[#8B5E3C] focus:outline-none focus:border-[#8B5E3C]/30"
                            />
                        )}
                    </div>

                    {/* Manual Steps Override */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-normal flex items-center gap-2">
                          <Activity className="w-3 h-3" /> Inference Steps
                        </label>
                        <span className="text-[10px] text-[#8B5E3C] font-mono">{manualSteps ?? QUALITY_MODES[quality].steps}</span>
                      </div>
                      <input
                        type="range" min="10" max="100" step="1"
                        value={manualSteps ?? QUALITY_MODES[quality].steps}
                        onChange={(e) => setManualSteps(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#8B5E3C]"
                      />
                    </div>

                    {/* Manual Resolution Override */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-normal flex items-center gap-2">
                          <Maximize className="w-3 h-3" /> Octree Resolution
                        </label>
                        <span className="text-[10px] text-[#8B5E3C] font-mono">{manualResolution ?? QUALITY_MODES[quality].resolution}</span>
                      </div>
                      <input
                        type="range" min="128" max="512" step="32"
                        value={manualResolution ?? QUALITY_MODES[quality].resolution}
                        onChange={(e) => setManualResolution(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#8B5E3C]"
                      />
                    </div>
                </div>

                <button 
                    onClick={() => {
                        setCreativity(5);
                        setAutoClean(true);
                        setDetailLevel(8000);
                        setSeed(1234);
                        setRandomizeSeed(true);
                        setManualSteps(null);
                        setManualResolution(null);
                    }}
                    className="w-full py-6 text-[10px] uppercase tracking-[0.4em] text-white/60 hover:text-[#8B5E3C] transition-all flex items-center justify-center gap-3 border border-dashed border-white/10 mt-4 font-normal"
                >
                    <RefreshCcw className="w-4 h-4" /> Reset Studio Defaults
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Upload */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-5 h-5 rounded-full border border-[#8B5E3C]/30 flex items-center justify-center text-[9px] font-medium text-[#8B5E3C]">2</div>
             <h3 className="text-xs font-normal uppercase tracking-[0.4em] text-white/70">Upload Source Asset</h3>
          </div>
          <div
            onClick={() => !isBusy && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (!isBusy) setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              onFileSelect(e.dataTransfer.files[0], getEngineOptions());
            }}
            className={`relative border border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center min-h-[160px] sm:min-h-[220px]
              ${isBusy ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#8B5E3C]/50 bg-white/[0.01]'}
              ${isDragging ? 'border-[#8B5E3C] bg-[#8B5E3C]/5' : 'border-white/10'}
            `}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain max-h-[180px] p-6" />
            ) : (
              <div className="text-center p-8">
                <ImagePlus className={`w-10 h-10 mx-auto mb-6 transition-colors ${isDragging ? 'text-[#8B5E3C]' : 'text-white/10'}`} />
                <p className="text-white/60 text-[10px] uppercase tracking-[0.4em] font-medium leading-relaxed">
                  {isDragging ? 'Release to upload' : 'Drag image or click to browse'}
                </p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" onChange={(e) => onFileSelect(e.target.files[0], getEngineOptions())} disabled={isBusy} className="hidden" />
          </div>
        </div>

        {/* Step 3: Status & Progress */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-5 h-5 rounded-full border border-[#8B5E3C]/30 flex items-center justify-center text-[9px] font-medium text-[#8B5E3C]">3</div>
             <h3 className="text-xs font-normal uppercase tracking-[0.4em] text-white/70">Engine Status</h3>
          </div>
          <div className="p-8 bg-white/[0.02] border border-white/5 space-y-8">
            <div className="flex items-start gap-4">
              {isBusy ? (
                <div className="w-5 h-5 border-2 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mt-0.5" />
              ) : (
                <Sparkles className={`w-5 h-5 mt-0.5 ${status === 'done' ? 'text-[#8B5E3C]' : 'text-white/10'}`} />
              )}
              <p className={`text-xs font-normal leading-relaxed uppercase tracking-[0.2em]
                ${status === 'error' ? 'text-red-400' : status === 'done' ? 'text-[#8B5E3C]' : 'text-white/70'}`}
              >
                {error ?? STATUS_LABEL[status]}
              </p>
            </div>

            <AnimatePresence>
              {isBusy && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pt-2">
                  <div className="flex justify-between text-[10px] text-white/70 font-normal uppercase tracking-[0.5em]">
                    <span>Neural Sculpting</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full bg-[#8B5E3C]"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls */}
        {(status !== 'idle' || meshUrl) && (
          <div className="pt-6 flex flex-col gap-4">
            {meshUrl && (
              <a
                href={meshUrl}
                download="artisan-model.glb"
                className="flex items-center justify-center gap-4 w-full py-4 text-xs font-medium uppercase tracking-[0.4em] bg-[#8B5E3C] text-white hover:bg-white hover:text-black transition-all shadow-2xl"
              >
                <Download className="w-5 h-5" /> Download GLB Asset
              </a>
            )}
            <button
              onClick={onReset}
              disabled={isBusy}
              className="flex items-center justify-center gap-4 w-full py-6 text-[10px] font-normal uppercase tracking-[0.4em] border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
            >
              <RotateCcw className="w-5 h-5" /> Reset Studio Engine
            </button>
          </div>
        )}
      </div>


    </div>
  );
}

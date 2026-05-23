import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Download, RotateCcw, Settings2, ChevronDown, Wand2, RefreshCcw, ArrowLeft, Zap, Box, Layers, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABEL = {
  idle: 'Enter a descriptive prompt to generate a 3D model',
  connecting: 'Connecting to AI engine…',
  generating: 'Sculpting 3D model (~60-120s)…',
  done: 'Done! Drag to orbit, scroll to zoom.',
  error: 'Generation failed.',
};

const QUALITY_MODES = {
  fast: { label: 'Fast', icon: Zap, steps: 20, desc: 'Quick concept, lower detail' },
  balanced: { label: 'Balanced', icon: Box, steps: 35, desc: 'Good balance of speed & quality' },
  high: { label: 'High', icon: Layers, steps: 50, desc: 'Maximum detail, slower generation' },
};

export default function PromptSidebar({
  status,
  progress,
  error,
  meshUrl,
  onGenerate,
  onReset,
}) {
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('balanced');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [creativity, setCreativity] = useState(7); // Guidance Scale

  const isBusy = status === 'connecting' || status === 'generating';

  const handleGenerate = () => {
    if (!prompt.trim() || isBusy) return;
    onGenerate(prompt, {
      steps: QUALITY_MODES[quality].steps,
      guidanceScale: creativity
    });
  };

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
          Text <span className="text-[#8B5E3C] italic font-serif">Engine</span>
        </h2>
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-medium">Generative AI Sculpting</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar">

        {/* Step 1: Prompt Input */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-full border border-[#8B5E3C]/30 flex items-center justify-center text-[8px] font-normal text-[#8B5E3C]">1</div>
             <h3 className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">Descriptive Prompt</h3>
          </div>
          <div className="relative">
            <div className="absolute top-4 left-4 text-white/20">
                <AlignLeft className="w-5 h-5" />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isBusy}
              placeholder="e.g. A futuristic sleek gaming chair with neon green accents, highly detailed, minimalist design..."
              className={`w-full h-32 sm:h-40 bg-white/[0.02] border border-white/10 text-white text-sm leading-relaxed p-4 pl-12 focus:outline-none focus:border-[#8B5E3C] transition-all resize-none font-light placeholder:text-white/20 custom-scrollbar ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Step 2: Quality Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-full border border-[#8B5E3C]/30 flex items-center justify-center text-[8px] font-normal text-[#8B5E3C]">2</div>
             <h3 className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">Select Quality</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(QUALITY_MODES).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => !isBusy && setQuality(key)}
                className={`flex flex-col items-center gap-3 py-6 px-2 border transition-all
                  ${quality === key
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
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 group-hover:text-white font-normal">Advanced Parameters</span>
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
                {/* AI Creativity */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-normal flex items-center gap-2">
                      <Wand2 className="w-3 h-3 text-[#8B5E3C]" /> Prompt Adherence
                    </label>
                    <span className="text-[10px] text-[#8B5E3C] font-mono font-medium">{creativity}</span>
                  </div>
                  <input
                    type="range" min="1" max="15" step="1"
                    value={creativity}
                    onChange={(e) => setCreativity(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#8B5E3C]"
                  />
                  <p className="text-[8px] text-white/20 uppercase tracking-widest italic">Higher = Strict adherence, Lower = AI creative freedom</p>
                </div>

                <button 
                    onClick={() => {
                        setCreativity(7);
                    }}
                    className="w-full py-4 text-[10px] uppercase tracking-[0.4em] text-white/60 hover:text-[#8B5E3C] transition-all flex items-center justify-center gap-3 border border-dashed border-white/10 mt-4 font-normal"
                >
                    <RefreshCcw className="w-4 h-4" /> Reset Settings
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
            onClick={handleGenerate}
            disabled={isBusy || !prompt.trim()}
            className="w-full bg-[#8B5E3C] text-white py-5 text-[11px] uppercase tracking-[0.4em] font-medium hover:bg-white hover:text-black transition-all shadow-xl disabled:opacity-50 disabled:hover:bg-[#8B5E3C] disabled:hover:text-white flex justify-center items-center gap-3"
        >
            <Sparkles className="w-4 h-4" /> Initialize Generation
        </button>

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
                <Download className="w-5 h-5" /> Download Asset
              </a>
            )}
            <button
              onClick={() => {
                setPrompt('');
                onReset();
              }}
              disabled={isBusy}
              className="flex items-center justify-center gap-4 w-full py-4 text-[10px] font-normal uppercase tracking-[0.4em] border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset Engine
            </button>
          </div>
        )}
      </div>


    </div>
  );
}

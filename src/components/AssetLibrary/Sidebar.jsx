import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Loader2, Boxes, X, ChevronDown, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

const BACKEND_URL = `http://${window.location.hostname}:5000`;

const DEFAULT_QUERIES = ['furniture', 'chair', 'lamp', 'sofa'];

export default function Sidebar({ onSelectModel, selectedModel, onClose, isMobile }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState([]);
  const [sourceFilter, setSourceFilter] = useState('all');
  const { user } = useAuth();
  const [localModels, setLocalModels] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchModels = async () => {
      try {
        const q = query(collection(db, `users/${user.uid}/models`));
        const snapshot = await getDocs(q);
        const modelData = snapshot.docs.map(doc => ({
          uid: doc.id,
          name: doc.data().name,
          author: 'My Studio',
          thumbnail: doc.data().thumbnail || null,
          meshUrl: doc.data().meshUrl,
          isLocal: true
        }));
        setLocalModels(modelData);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchModels();
  }, [user?.uid]);

  const performSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/search?q=${q}`);
      setResults(res.data.results || []);
    } catch (err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const randomSearch = DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];
    performSearch(randomSearch);
  }, []);

  // Suggestions logic
  useEffect(() => {
    if (!query.trim()) { setDynamicSuggestions([]); return; }
    const fetchSug = async () => {
      try {
        const res = await axios.get(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}`);
        setDynamicSuggestions(res.data.slice(0, 5).map(i => i.word));
      } catch (_) {}
    };
    const t = setTimeout(fetchSug, 300);
    return () => clearTimeout(t);
  }, [query]);

  const displayedResults = useMemo(() => {
    let base = [...results];
    
    if (sourceFilter === 'local') return localModels;
    if (sourceFilter === 'api') return base;
    
    // Merge logic: Show local models at the top
    return [...localModels, ...base];
  }, [results, localModels, sourceFilter]);

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-r border-white/5">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 pb-4 border-b border-white/5 bg-[#0D0D0D] sticky top-0 z-50">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#F4F1EE]/40 hover:text-[#8B5E3C] transition-colors group mb-4"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          Exit to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-6 sm:mb-6">
          <h2 className="text-base sm:text-xl font-light tracking-[0.3em] uppercase">
            Asset <span className="text-[#8B5E3C] italic font-serif">Studio</span>
          </h2>
          {isMobile && (
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative group mb-6">
          <form onSubmit={(e) => { e.preventDefault(); performSearch(query); setShowSuggestions(false); }}>
            <input 
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
              placeholder="Search library..."
              className="w-full bg-white/[0.02] border border-white/10 p-5 pl-14 text-xs uppercase tracking-[0.2em] text-white placeholder-white/60 focus:outline-none focus:border-[#8B5E3C]/50 transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-[#8B5E3C] transition-colors" />
          </form>

          {/* Autocomplete */}
          <AnimatePresence>
            {showSuggestions && query.trim() && dynamicSuggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-[#8B5E3C]/20 z-[100] shadow-2xl"
              >
                {dynamicSuggestions.map((s, i) => (
                  <div key={i} onMouseDown={(e) => { e.preventDefault(); setQuery(s); performSearch(s); setShowSuggestions(false); }}
                    className="px-5 py-4 hover:bg-[#8B5E3C]/10 cursor-pointer text-[10px] uppercase tracking-widest text-white/70 hover:text-white border-b border-white/[0.02]"
                  >
                    {s}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Source Filter */}
        <div className="relative">
          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 py-3 pl-4 pr-10 text-[9px] uppercase tracking-widest font-normal text-white/70 appearance-none focus:outline-none focus:border-[#8B5E3C]/30 cursor-pointer"
          >
            <option value="all" className="bg-[#0D0D0D]">All Sources</option>
            <option value="local" className="bg-[#0D0D0D]">My Studio</option>
            <option value="api" className="bg-[#0D0D0D]">Cloud Library</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-20 pointer-events-none" />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12">
            <Loader2 className="w-6 h-6 animate-spin mb-4 text-[#8B5E3C]" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/60 font-normal">Syncing Library</span>
          </div>
        )}

        {!loading && displayedResults.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {displayedResults.map(model => (
              <div 
                key={model.uid}
                onClick={() => onSelectModel(model)}
                className={`relative group p-3 border transition-all duration-500 cursor-pointer
                  ${selectedModel?.uid === model.uid ? 'border-[#8B5E3C] bg-[#8B5E3C]/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}
                `}
              >
                <div className="aspect-square bg-black mb-3 overflow-hidden">
                  {model.thumbnail ? (
                    <img src={model.thumbnail} alt={model.name} className={`w-full h-full object-cover transition-all duration-700 ${selectedModel?.uid === model.uid ? 'scale-110' : 'group-hover:scale-110'}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <Boxes className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-medium uppercase tracking-widest truncate mb-1">{model.name}</p>
                <p className="text-[8px] text-[#F4F1EE]/70 uppercase tracking-widest truncate font-normal">{model.author}</p>
                {model.vertexCount && (
                  <p className="text-[7px] text-[#8B5E3C]/70 uppercase tracking-widest font-normal mt-1">{(model.vertexCount / 1000).toFixed(1)}k verts</p>
                )}
                
                {model.isLocal && (
                  <div className="absolute top-4 right-4 bg-[#8B5E3C]/20 border border-[#8B5E3C]/30 px-2 py-0.5 text-[7px] uppercase font-medium tracking-widest text-[#8B5E3C]">
                    MY ASSET
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

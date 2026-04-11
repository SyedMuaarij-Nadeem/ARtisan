import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';
import ModelCard from './ModelCard';

// Used exclusively to pick a cool random model when the page first loads
const DEFAULT_QUERIES = [
  'cyberpunk', 'sci-fi', 'fantasy', 'weapon', 'vehicle', 'architecture', 'products', 'furniture'
];

export default function Sidebar({ onSelectModel, selectedModel }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState([]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.results || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch models. Make sure the backend proxy is running.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load with random standard category
  useEffect(() => {
    const defaultSearch = DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];
    performSearch(defaultSearch);
  }, []);

  // Fetch live English dictionary suggestions using Datamuse API
  useEffect(() => {
    if (!query.trim()) {
      setDynamicSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}`);
        // Limit to top 5 sensible word completions
        const words = res.data.slice(0, 5).map(item => item.word);
        setDynamicSuggestions(words);
      } catch (err) {
        console.error("Failed to fetch autocomplete suggestions", err);
      }
    };

    // Debounce the dictionary API call by 300ms
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch(query);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-6 border-b border-white/5 bg-[#0b0f1a] sticky top-0 z-50 shrink-0">
        <h2 className="text-xl font-bold mb-5 font-poppins text-white/90 ml-12">
          <span className="text-[#00f5ff]">3D</span> Assets Library
        </h2>

        <div className="relative group">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search assets (e.g. car, character)"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00f5ff]/50 focus:ring-1 focus:ring-[#00f5ff]/50 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40 group-focus-within:text-[#00f5ff] transition-colors" />
            <button type="submit" className="hidden" />
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && query.trim() && dynamicSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0b0f1a]/95 border border-[#00f5ff]/20 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden z-[100]">
              {dynamicSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 hover:bg-[#00f5ff]/20 cursor-pointer text-white/70 transition-colors flex items-center gap-3 text-sm tracking-wide"
                  onClick={() => {
                    setQuery(suggestion);
                    setShowSuggestions(false);
                    performSearch(suggestion);
                  }}
                >
                  <Search className="w-3 h-3 text-[#00f5ff]/50" />
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-[#00f5ff]">
            <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-80" />
            <span className="text-xs tracking-wider uppercase text-[#00f5ff]/60">Scanning library...</span>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center p-8 text-white/30 text-sm font-light italic">
            No models found. Try a different keyword.
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}
          >
            {results.map(model => (
              <ModelCard
                key={model.uid}
                model={model}
                isSelected={selectedModel?.uid === model.uid}
                onClick={() => onSelectModel(model)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

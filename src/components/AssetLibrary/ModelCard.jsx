export default function ModelCard({ model, isSelected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-300 group overflow-hidden h-full
        ${isSelected 
          ? 'bg-[#00f5ff]/10 border-[#00f5ff]/50 shadow-[0_0_15px_rgba(0,245,255,0.15)] bg-linear-to-b from-[#00f5ff]/5 to-transparent' 
          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5'
        }
      `}
    >
      {isSelected && (
        <div className="absolute inset-0 z-0 bg-linear-to-r from-[#00f5ff]/20 to-transparent blur-xl opacity-50 pointer-events-none" />
      )}
      
      <div className="flex flex-col gap-3 relative z-10 h-full">
        <div className="w-full aspect-square rounded-lg overflow-hidden shrink-0 bg-black/50 border border-white/10 shadow-inner">
          <img 
            src={model.thumbnail || 'https://via.placeholder.com/150'} 
            alt={model.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className={`font-semibold text-sm truncate transition-colors duration-300 ${isSelected ? 'text-[#00f5ff]' : 'text-white/90 group-hover:text-[#00f5ff]'}`}>
              {model.name}
            </h3>
            <p className="text-xs text-white/40 truncate mt-0.5" title={model.author}>By {model.author}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/30 font-light mt-2">
            {model.vertexCount && (
              <span className="px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/5">
                {(model.vertexCount / 1000).toFixed(1)}k verts
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

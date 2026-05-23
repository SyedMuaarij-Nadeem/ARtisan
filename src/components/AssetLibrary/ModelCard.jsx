export default function ModelCard({ model, isSelected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`relative bg-[#0D0D0D] border cursor-pointer transition-all duration-500 group overflow-hidden h-full
        ${isSelected 
          ? 'border-[#8B5E3C] shadow-[0_0_30px_rgba(139,94,60,0.15)] scale-[1.02]' 
          : 'border-white/5 hover:border-[#8B5E3C]/40'
        }
      `}
    >
      <div className="flex flex-col relative z-10 h-full">
        {/* Thumbnail Area */}
        <div className="w-full aspect-square overflow-hidden shrink-0 bg-black/50 border-b border-white/5 relative">
          <img 
            src={model.thumbnail || 'https://via.placeholder.com/150'} 
            alt={model.name}
            className={`w-full h-full object-cover transition-all duration-700 
                ${isSelected ? 'scale-110 grayscale-0' : 'grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-110'}
            `}
            loading="lazy"
          />
          
          {/* Subtle Overlay on Hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-500
            ${isSelected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}
          `} />
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] truncate transition-colors duration-500 mb-1
                ${isSelected ? 'text-[#8B5E3C]' : 'text-white/60 group-hover:text-white'}
            `}>
              {model.name}
            </h3>
            <p className="text-[10px] text-white/20 uppercase tracking-widest truncate" title={model.author}>
                {model.author === 'Local Model' ? 'STUDIO ASSET' : `SOURCE: ${model.author.toUpperCase()}`}
            </p>
          </div>

          {model.vertexCount && (
            <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]/40" />
                <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
                    {(model.vertexCount / 1000).toFixed(1)}k geometry
                </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Selection Indicator */}
      {isSelected && (
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#8B5E3C] flex items-center justify-center translate-x-4 translate-y-4 rotate-45 z-20 shadow-2xl" />
      )}
    </div>
  );
}

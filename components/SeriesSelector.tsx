
import React from 'react';
import { SERIES } from '../constants';
import { Series, Orientation } from '../types';
// Added missing Shield icon import
import { Sparkles, Heart, History, Rocket, ChevronLeft, MessageCircle, UserCircle, Ghost, Users, BrainCircuit, HeartHandshake, Baby, Compass, Shield } from 'lucide-react';
import Logo from './Logo';

interface SeriesSelectorProps {
  onSelect: (series: Series) => void;
  orientation?: Orientation;
  customSeries?: Series[];
}

const SeriesSelector: React.FC<SeriesSelectorProps> = ({ onSelect, orientation, customSeries }) => {
  const isLandscape = orientation === Orientation.LANDSCAPE;
  const displaySeries = customSeries || SERIES;

  const getIcon = (id: number | 'ai') => {
    if (id === 'ai') return <BrainCircuit size={24} className="text-[#d4af37]" />;
    if (typeof id === 'number' && id >= 100) {
        // أيقونات مخصصة لسلاسل الأونلاين/A3
        switch(id) {
            case 101: return <History size={24} className="text-[#9b1c31]" />;
            case 102: return <Rocket size={24} className="text-[#d4af37]" />;
            case 103: return <Heart size={24} className="text-[#ff4d6d]" />;
            // fix: Shield is now imported from lucide-react
            case 104: return <Shield size={24} className="text-[#a0c4ff]" />;
        }
    }
    switch(id) {
      case 1: return <Sparkles size={24} className="text-[#d4af37]" />; 
      case 2: return <Heart size={24} className="text-[#ff4d6d]" />; 
      case 3: return <History size={24} className="text-[#e0e0e0]" />; 
      case 4: return <Rocket size={24} className="text-[#f9f1d0]" />; 
      case 5: return <MessageCircle size={24} className="text-[#d4af37]" />; 
      case 6: return <UserCircle size={24} className="text-[#ff4d6d]" />; 
      case 7: return <Ghost size={24} className="text-[#ffffff]/60" />; 
      case 8: return <Users size={24} className="text-[#d4af37]" />; 
      case 9: return <HeartHandshake size={24} className="text-[#9b1c31]" />; 
      case 10: return <Baby size={24} className="text-[#d4af37]" />; 
      case 11: return <Compass size={24} className="text-[#a0c4ff]" />; 
      default: return <Sparkles size={24} className="text-[#d4af37]" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 md:p-6 w-full mx-auto py-10 transition-all duration-500 ${isLandscape ? 'max-w-7xl' : 'max-w-2xl'}`}>
      <header className={`text-center transition-all duration-500 flex flex-col items-center ${isLandscape ? 'mb-8' : 'mb-16'}`}>
        <div className={`inline-block px-4 py-1.5 rounded-full bg-white/5 border border-[#d4af37]/20 text-[#d4af37]/80 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 backdrop-blur-md transition-all ${isLandscape ? 'opacity-60 scale-90 mb-4' : 'mb-12'}`}>
          تطوير أشواق الشامل v6.0
        </div>
        
        <div className={`transition-all duration-700 ${isLandscape ? 'scale-75 -my-10' : ''}`}>
          <Logo size={isLandscape ? 'md' : 'lg'} className="mb-4" />
        </div>
        
        <p className={`text-white/40 font-light mx-auto leading-relaxed italic transition-all ${isLandscape ? 'text-base max-w-lg mt-0' : 'text-lg max-w-sm mt-4'}`}>
          اكتشف أعماق المشاعر مع ذكاء اصطناعي يفهم نبض القلوب.
        </p>
      </header>

      <div className={`grid gap-4 md:gap-5 w-full transition-all duration-500 ${isLandscape ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {displaySeries.map((series) => (
          <button
            key={series.id}
            onClick={() => onSelect(series)}
            className={`group relative glass-card rounded-[2rem] transition-all duration-500 hover:scale-[1.03] active:scale-95 text-right overflow-hidden flex items-center justify-between border border-white/5 hover:border-[#d4af37]/40 shadow-2xl ${isLandscape ? 'p-4 md:p-5' : 'p-6'} ${series.id === 'ai' ? 'border-[#d4af37]/30 bg-[#d4af37]/5' : ''}`}
          >
            <div className="flex items-center gap-4 z-10 overflow-hidden">
              <div 
                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37]/30 transition-all shadow-inner shrink-0 ${series.id === 'ai' ? 'animate-pulse' : ''}`}
                style={{ borderColor: series.id === 'ai' ? '#d4af3740' : undefined }}
              >
                {getIcon(series.id)}
              </div>
              <div className="flex flex-col overflow-hidden text-right">
                <span className="text-[#d4af37]/40 text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60">
                    {series.id === 'ai' ? 'تقنية حصرية' : `سلسلة ${series.id}`}
                </span>
                <h3 className={`font-bold text-white group-hover:text-[#d4af37] transition-colors leading-tight truncate ${isLandscape ? 'text-base' : 'text-xl'}`}>{series.name}</h3>
                <p className="text-white/30 text-[10px] font-normal mt-0.5 leading-tight line-clamp-1">{series.description}</p>
              </div>
            </div>
            <ChevronLeft size={16} className="text-white/20 group-hover:translate-x-[-6px] group-hover:text-[#d4af37] transition-all shrink-0" />
            
            {series.id === 'ai' && (
                <div className="absolute top-0 left-0 bg-[#d4af37] text-black text-[8px] px-3 py-1 font-black rounded-br-xl">AI POWERED</div>
            )}

            <div className={`absolute -right-12 -bottom-12 w-32 h-32 blur-[50px] rounded-full group-hover:bg-opacity-20 transition-all ${series.id === 'ai' ? 'bg-[#d4af37]/15' : 'bg-[#9b1c31]/5'}`}></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SeriesSelector;

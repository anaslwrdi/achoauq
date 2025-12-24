
import React, { useEffect } from 'react';
import { Sparkles, RotateCcw, LayoutGrid, Award, Star } from 'lucide-react';
import { Orientation } from '../types';
import { feedback } from '../utils/feedback';

interface SeriesCompletedScreenProps {
  seriesName: string;
  onRestart: () => void;
  onNewSeries: () => void;
  orientation?: Orientation;
}

const SeriesCompletedScreen: React.FC<SeriesCompletedScreenProps> = ({ 
  seriesName, 
  onRestart, 
  onNewSeries, 
  orientation 
}) => {
  const isLandscape = orientation === Orientation.LANDSCAPE;

  useEffect(() => {
    // تشغيل نغمة النجاح عند التحميل
    feedback.playSuccess();
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 md:p-6 w-full mx-auto transition-all duration-500 ${isLandscape ? 'max-w-4xl' : 'max-w-xl'}`}>
      <div className="relative group w-full">
        {/* Glowing Aura Background */}
        <div className="absolute -inset-10 bg-gradient-to-r from-[#d4af37]/20 to-[#9b1c31]/20 blur-[100px] opacity-50 rounded-full animate-pulse"></div>
        
        <div className={`relative glass-card rounded-[3rem] md:rounded-[4rem] w-full border border-[#d4af37]/20 shadow-2xl overflow-hidden flex flex-col items-center text-center transition-all duration-500 p-10 md:p-16`}>
          
          {/* Animated Victory Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#d4af37]/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#d4af37] to-[#bf953f] flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.4)] relative z-10 border-4 border-white/20">
              <Award size={isLandscape ? 56 : 64} className="text-black" />
            </div>
            {/* Small floating stars */}
            <Star size={16} className="absolute -top-2 -right-2 text-[#d4af37] animate-bounce" style={{animationDelay: '0.1s'}} />
            <Star size={20} className="absolute top-10 -left-6 text-[#f9f1d0] animate-bounce" style={{animationDelay: '0.5s'}} />
            <Sparkles size={24} className="absolute -bottom-4 right-4 text-[#ff4d6d] animate-pulse" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-gradient-gold mb-4 leading-tight">اكتملت الرحلة</h2>
          
          <p className="text-white/60 text-lg md:text-xl font-light mb-12 max-w-sm mx-auto leading-relaxed">
            لقد أبحرت في أعماق <span className="text-[#d4af37] font-bold">"{seriesName}"</span> واستكشفت خباياها بنجاح.
          </p>

          <div className={`flex w-full gap-4 transition-all duration-500 ${isLandscape ? 'flex-row' : 'flex-col'}`}>
            <button 
              onClick={() => { feedback.playClick(); onRestart(); }}
              className="flex-1 group bg-white/5 hover:bg-white/10 text-white rounded-[2rem] py-5 px-8 font-bold transition-all border border-white/10 flex items-center justify-center gap-3 active:scale-95"
            >
              <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform text-[#d4af37]" />
              إعادة السلسلة
            </button>
            
            <button 
              onClick={() => { feedback.playClick(); onNewSeries(); }}
              className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f9f1d0] text-black rounded-[2rem] py-5 px-8 font-black transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 active:scale-95 border border-white/20"
            >
              <LayoutGrid size={20} />
              سلسلة جديدة
            </button>
          </div>

          <div className="mt-12 opacity-20 flex flex-col items-center">
             <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mb-4"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Mahra Royale Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesCompletedScreen;

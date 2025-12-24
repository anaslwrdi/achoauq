
import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Orientation } from '../types';

interface RulesScreenProps {
  onStart: () => void;
  seriesName: string;
  orientation?: Orientation;
}

const RulesScreen: React.FC<RulesScreenProps> = ({ onStart, seriesName, orientation }) => {
  const isLandscape = orientation === Orientation.LANDSCAPE;

  const rules = [
    "الصدق هو مفتاح التجربة الحقيقية",
    "احترام المساحة الخاصة للطرف الآخر",
    "الاستماع بعمق قبل الإجابة",
    "ما يقال هنا.. يبقى هنا للأبد"
  ];

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 md:p-6 w-full mx-auto transition-all duration-500 ${isLandscape ? 'max-w-4xl' : 'max-w-xl'}`}>
      <div className={`glass-card rounded-[3rem] md:rounded-[4rem] w-full border border-[#d4af37]/20 shadow-2xl relative overflow-hidden flex transition-all duration-500 ${isLandscape ? 'flex-row p-8 md:p-12 items-center gap-10' : 'flex-col p-10 md:p-16'}`}>
        
        {/* Left Side (or Top) - Visual Identity */}
        <div className={`flex flex-col items-center transition-all ${isLandscape ? 'w-1/3' : 'mb-10'}`}>
          <div className={`rounded-full bg-[#9b1c31]/10 border border-[#9b1c31]/20 flex items-center justify-center text-[#ff4d6d] shadow-[0_0_40px_rgba(155,28,49,0.2)] transition-all ${isLandscape ? 'w-20 h-20 md:w-24 md:h-24 mb-6' : 'w-24 h-24 mb-6'}`}>
            <ShieldCheck size={isLandscape ? 40 : 48} />
          </div>
          <h2 className={`${isLandscape ? 'text-2xl md:text-3xl' : 'text-4xl'} font-black text-center text-gradient-gold mb-2`}>ميثاق الجلسة</h2>
          <p className="text-white/30 text-center text-[10px] md:text-xs tracking-widest font-bold uppercase">دستور العشاق</p>
        </div>

        {/* Right Side (or Bottom) - Rules & Action */}
        <div className={`flex flex-col transition-all ${isLandscape ? 'w-2/3 border-r border-white/5 pr-10' : ''}`}>
          <div className={`flex flex-col gap-6 md:gap-8 ${isLandscape ? 'mb-10' : 'mb-16'}`}>
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-5 text-right group">
                <div className="w-2 h-2 rounded-full bg-[#9b1c31] group-hover:scale-150 group-hover:bg-[#d4af37] transition-all shrink-0"></div>
                <p className={`text-white/80 font-bold leading-tight group-hover:text-white transition-colors ${isLandscape ? 'text-lg' : 'text-xl'}`}>{rule}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={onStart}
            className={`w-full bg-[#6d1322] hover:bg-[#b02239] text-white rounded-[2rem] font-black transition-all duration-300 shadow-[0_20px_50px_rgba(109,19,34,0.4)] active:scale-95 flex items-center justify-center gap-3 border border-white/5 ${isLandscape ? 'py-4 text-xl' : 'py-6 text-2xl'}`}
          >
            أوافق وأبدأ الآن
          </button>

          <div className="mt-8 flex items-center justify-center gap-3 opacity-20">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">{seriesName}</span>
             <Info size={14} className="text-[#d4af37]" />
          </div>
        </div>
      </div>
      
      {!isLandscape && (
        <div className="mt-16 text-white/10 text-[11px] font-black tracking-[0.8em] uppercase animate-pulse">
          Pure connection • Ashwaq Exclusive
        </div>
      )}
    </div>
  );
};

export default RulesScreen;

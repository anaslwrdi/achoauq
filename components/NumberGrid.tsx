
import React from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { Orientation, Question } from '../types';

interface NumberGridProps {
  onSelect: (id: number | string) => void;
  selectedIds: (number | string)[];
  questions: Question[];
  seriesName: string;
  onBack: () => void;
  orientation?: Orientation;
}

const NumberGrid: React.FC<NumberGridProps> = ({ onSelect, selectedIds, questions, seriesName, onBack, orientation }) => {
  const isLandscape = orientation === Orientation.LANDSCAPE;
  const progress = Math.round((selectedIds.filter(id => questions.some(q => q.id === id)).length / questions.length) * 100);

  return (
    <div className={`flex flex-col items-center min-h-screen p-4 md:p-6 w-full mx-auto py-12 transition-all duration-500 ${isLandscape ? 'max-w-6xl' : 'max-w-2xl'}`}>
      <div className="w-full flex justify-between items-center mb-10 p-4 rounded-3xl nav-premium-animate border border-white/5 shadow-2xl">
        <button 
          onClick={onBack}
          className="glass-card hover:bg-white/5 text-white p-4 rounded-2xl transition-all border border-[#d4af37]/20 active:scale-90"
        >
          <ArrowRight size={24} className="text-[#d4af37]" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gradient-gold text-center">{seriesName}</h2>
          <span className="text-[10px] text-white/30 font-black tracking-[0.4em] uppercase mt-1">لوحة التحكم</span>
        </div>
        <div className="w-12"></div>
      </div>

      <div className={`w-full flex gap-6 md:gap-10 items-stretch ${isLandscape ? 'flex-row' : 'flex-col'}`}>
        {/* Progress Card */}
        <div className={`glass-card p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-[#d4af37]/10 flex items-center justify-between overflow-hidden relative transition-all duration-500 ${isLandscape ? 'w-1/3 flex-col justify-center gap-10' : 'w-full mb-6'}`}>
          <div className={`flex flex-col gap-2 z-10 ${isLandscape ? 'items-center text-center' : ''}`}>
            <span className="text-[#d4af37]/40 text-[11px] font-black tracking-widest uppercase">التقدم</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">{progress}%</span>
            </div>
          </div>
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/5 flex items-center justify-center relative z-10 shadow-2xl">
             <LayoutGrid className="text-[#9b1c31]/40" size={30} />
             <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
               <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="264" strokeDashoffset={264 - (264 * progress) / 100} className="text-[#9b1c31] transition-all duration-1000 ease-out" />
             </svg>
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-[#9b1c31]/5 pointer-events-none"></div>
        </div>
        
        {/* Numbers Grid - Responsive for 30 questions */}
        <div className={`grid gap-2.5 md:gap-4 transition-all duration-500 ${isLandscape ? 'grid-cols-6 w-2/3' : 'grid-cols-5 w-full'}`}>
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => onSelect(q.id)}
              className={`aspect-square flex items-center justify-center text-lg md:text-2xl font-bold rounded-xl md:rounded-2xl transition-all duration-500 transform active:scale-90 ${selectedIds.includes(q.id) ? 'bg-[#9b1c31]/20 text-[#ff4d6d] border border-[#9b1c31]/40 shadow-[0_0_20px_rgba(155,28,49,0.2)]' : 'glass-card text-white hover:bg-white/10 hover:-translate-y-1 border border-white/5'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberGrid;

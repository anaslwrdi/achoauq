
import React from 'react';
import { Smartphone, Globe, User, ArrowLeft, Users, Shield, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { feedback } from '../utils/feedback';

interface ModeSelectorProps {
  onSelectMode: (mode: 'ONE_DEVICE' | 'ONLINE' | 'SOLO') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full max-w-6xl mx-auto animate-in fade-in duration-1000">
      <div className="mb-12">
        <Logo size="lg" className="transform scale-90 md:scale-100" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
        {/* Online Play Mode (A1) */}
        <button 
          onClick={() => { feedback.playClick(); onSelectMode('ONLINE'); }}
          className="group relative glass-card rounded-[3rem] p-8 border border-[#9b1c31]/20 hover:border-[#9b1c31]/50 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center text-center shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#9b1c31]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#9b1c31]/10 flex items-center justify-center mb-6 text-[#ff4d6d] group-hover:scale-110 transition-transform duration-500">
            <Globe size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">A1</h2>
          <p className="text-white/40 text-xs leading-relaxed max-w-[180px]">
            اتصال رقمي بين جهازين مختلفين في أي مكان.
          </p>
          <div className="mt-8 px-5 py-1.5 rounded-full border border-white/5 text-[9px] font-black text-[#ff4d6d] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all">
            دخول البوابة
          </div>
        </button>

        {/* Local Play Mode (A2) */}
        <button 
          onClick={() => { feedback.playClick(); onSelectMode('ONE_DEVICE'); }}
          className="group relative glass-card rounded-[3rem] p-8 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mb-6 text-[#d4af37] group-hover:scale-110 transition-transform duration-500">
            <Smartphone size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">A2</h2>
          <p className="text-white/40 text-xs leading-relaxed max-w-[180px]">
            للاعبين بجوار بعضهما، يتم تمرير الجهاز بينكما.
          </p>
          <div className="mt-8 px-5 py-1.5 rounded-full border border-white/5 text-[9px] font-black text-[#d4af37] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all">
            بدء اللقاء
          </div>
        </button>

        {/* Solo Play Mode (A3) */}
        <button 
          onClick={() => { feedback.playClick(); onSelectMode('SOLO'); }}
          className="group relative glass-card rounded-[3rem] p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]"></div>
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white/60 group-hover:scale-110 transition-transform duration-500">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">A3</h2>
          <p className="text-white/40 text-xs leading-relaxed max-w-[180px]">
            رحلة استكشاف ذاتية للغوص في أعماق أفكارك ومشاعرك.
          </p>
          <div className="mt-8 px-5 py-1.5 rounded-full border border-white/5 text-[9px] font-black text-white/40 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all">
            تأمل فردي
          </div>
        </button>
      </div>

      <div className="mt-16 opacity-10 flex flex-col items-center gap-2">
         <div className="w-12 h-[1px] bg-white"></div>
         <span className="text-[9px] font-black tracking-[0.5em] uppercase text-white">Ashwaq Premium Experience</span>
      </div>
    </div>
  );
};

export default ModeSelector;

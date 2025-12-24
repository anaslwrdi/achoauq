
import React, { useState, useMemo, useEffect } from 'react';
import { Question, Orientation } from '../types';
import { Share2, CornerUpRight, Heart, Sparkles, Check, Flag, ChevronLeft } from 'lucide-react';
import Logo from './Logo';
import { SERIES } from '../constants';
import { feedback } from '../utils/feedback';

interface QuestionCardProps {
  question: Question;
  onBack: () => void;
  onNext: () => void;
  orientation?: Orientation;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  currentIndex?: number;
  totalCount?: number;
  isLastQuestion?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onBack, 
  onNext, 
  orientation, 
  isFavorite, 
  onToggleFavorite,
  currentIndex,
  totalCount,
  isLastQuestion
}) => {
  const isLandscape = orientation === Orientation.LANDSCAPE;
  const [copied, setCopied] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // إعادة ضبط حالة الخروج عند تغير السؤال (بدء حركة الدخول)
  useEffect(() => {
    setIsExiting(false);
  }, [question.id]);

  const seriesColor = useMemo(() => {
    const series = SERIES.find(s => s.id === question.seriesId);
    return series?.color || "#d4af37";
  }, [question.seriesId]);

  const fontSizeClass = useMemo(() => {
    const length = question.text.length;
    if (isLandscape) {
      if (length > 150) return 'text-base md:text-lg';
      if (length > 100) return 'text-lg md:text-xl';
      return 'text-xl md:text-2xl lg:text-3xl';
    } else {
      if (length > 150) return 'text-lg md:text-xl';
      if (length > 100) return 'text-xl md:text-2xl';
      return 'text-2xl md:text-4xl lg:text-5xl';
    }
  }, [question.text, isLandscape]);

  const handleShare = () => {
    feedback.playClick();
    const text = `سؤال من لعبة أشواق ✨:\n\n"${question.text}"\n\nعش التجربة الملكية في لعبة أشواق 👑`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptionClick = () => {
    feedback.haptic(15);
    feedback.playClick();
  };

  const handleNextWithTransition = () => {
    if (isExiting) return;
    
    feedback.playClick();
    setIsExiting(true);
    
    // الانتظار قليلاً حتى ينتهي تأثير الخروج قبل تحديث البيانات
    setTimeout(() => {
      onNext();
    }, 400); // يتوافق مع مدة الانتقال في CSS
  };

  return (
    <div className={`relative flex flex-col items-center w-full mx-auto transition-all duration-500 overflow-x-hidden ${isLandscape ? 'min-h-screen pt-4 pb-28 px-6' : 'min-h-screen pt-12 pb-32 px-4'}`}>
      
      {/* Header Area */}
      <div className={`w-full flex justify-between items-center z-20 max-w-6xl mx-auto transition-all duration-700 ${isLandscape ? 'mb-4' : 'mb-8 md:mb-12'} ${isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <button 
          onClick={onBack}
          className="glass-card hover:bg-white/5 text-white/60 hover:text-[#d4af37] px-3 py-2 md:px-5 md:py-2.5 rounded-xl transition-all border border-white/5 flex items-center gap-2 active:scale-90"
        >
          <CornerUpRight size={18} />
          <span className="hidden sm:inline text-xs font-bold">العودة</span>
        </button>
        
        <div className="flex flex-col items-center">
           <div className={`origin-center opacity-40 hover:opacity-100 transition-all duration-500 ${isLandscape ? 'scale-[0.2] -mb-12' : 'scale-[0.3] -mb-10'}`}>
              <Logo size="sm" className="pointer-events-none" />
           </div>
           {!question.isAI && currentIndex && totalCount && (
             <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 shadow-lg">
                {isLastQuestion && <Flag size={12} className="text-[#ff4d6d] animate-pulse" />}
                <span className={`text-[10px] md:text-xs font-black tracking-wider ${isLastQuestion ? 'text-[#ff4d6d]' : 'text-[#d4af37]'}`}>
                   {isLastQuestion ? 'المحطة الأخيرة' : `سؤال ${currentIndex} من ${totalCount}`}
                </span>
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
           {question.isAI && (
               <div className="hidden sm:flex items-center gap-1 bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/20">
                  <span className="text-[10px] font-black text-[#d4af37]">AI</span>
                  <Sparkles size={12} className="text-[#d4af37] animate-pulse" />
               </div>
           )}
           <button 
             onClick={onToggleFavorite}
             className={`p-2 transition-all active:scale-125 ${isFavorite ? 'text-[#ff4d6d]' : 'text-white/20 hover:text-[#ff4d6d]/60'}`}
           >
             <Heart size={26} fill={isFavorite ? "currentColor" : "none"} />
           </button>
        </div>
      </div>

      {/* Main Content Area with Fluid Transition */}
      <div className={`flex flex-1 w-full max-w-6xl mx-auto gap-4 md:gap-8 transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] items-center justify-center ${isLandscape ? 'flex-row' : 'flex-col mb-8'} ${isExiting ? 'opacity-0 -translate-x-12 scale-[0.98] blur-sm' : 'opacity-100 translate-x-0 scale-100 blur-0'}`}>
        
        {/* Question Theater */}
        <div className={`relative group transition-all duration-500 h-full flex items-center justify-center ${isLandscape ? 'w-1/2 min-h-[300px]' : 'w-full min-h-[250px]'}`}>
          <div 
            className="absolute -inset-10 rounded-[4rem] blur-[80px] opacity-20 transition-all duration-1000 group-hover:opacity-40"
            style={{ background: `radial-gradient(circle, ${seriesColor}60 0%, transparent 70%)` }}
          ></div>
          
          <div className={`relative w-full h-full glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 flex flex-col items-center justify-center border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden min-h-[inherit]`}>
            {isLastQuestion && (
               <div className="absolute top-6 px-4 py-1.5 rounded-full border border-[#ff4d6d]/30 bg-[#ff4d6d]/5 text-[#ff4d6d] text-[9px] font-black tracking-widest uppercase animate-bounce z-10">
                  FINAL DESTINATION
               </div>
            )}
            
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                <Sparkles size={120} className="text-[#d4af37]" />
            </div>

            <div className="max-h-full overflow-y-auto w-full custom-scrollbar py-2 flex items-center justify-center z-10">
              <h2 className={`text-white font-bold text-center leading-relaxed font-amiri break-words w-full px-2 ${fontSizeClass}`}>
                {question.text}
              </h2>
            </div>
            
            <div className="absolute bottom-6 opacity-10">
                <div className="flex gap-2">
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                </div>
            </div>
          </div>
        </div>

        {/* Options Grid */}
        <div className={`grid gap-3 transition-all duration-500 auto-rows-fr ${isLandscape ? 'w-1/2 grid-cols-1 md:grid-cols-2' : 'w-full grid-cols-1 sm:grid-cols-2'}`}>
          {question.options.map((option, idx) => (
            <div
              key={idx}
              onClick={handleOptionClick}
              className={`glass-card text-white/60 font-medium rounded-2xl md:rounded-3xl border border-white/[0.03] flex items-center justify-center text-center transition-all hover:bg-white/[0.05] hover:text-white hover:border-[#d4af37]/20 cursor-pointer px-5 py-4 text-sm md:text-base relative group/opt shadow-lg active:scale-[0.98]`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <span className="opacity-10 text-[7px] md:text-[8px] absolute top-2 left-4 font-black tracking-tighter uppercase select-none">OP-0{idx + 1}</span>
              <span className="leading-snug py-1">{option}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-8 flex flex-col items-center z-40 pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-700 ${isExiting ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-4 w-full max-w-xl pointer-events-auto">
          <button 
              onClick={handleShare}
              className={`p-4 md:p-5 rounded-2xl md:rounded-3xl glass-card border transition-all active:scale-90 flex items-center justify-center ${copied ? 'border-green-500/50 text-green-400' : 'border-white/5 text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/30'}`}
              title="مشاركة"
          >
            {copied ? <Check size={22} /> : <Share2 size={22} />}
          </button>

          <button 
            onClick={handleNextWithTransition}
            disabled={isExiting}
            className={`flex-1 group bg-gradient-to-r ${isLastQuestion ? 'from-[#9b1c31] to-[#ff4d6d] shadow-[0_15px_40px_rgba(155,28,49,0.3)]' : 'from-[#d4af37] to-[#f9f1d0] shadow-[0_15px_40px_rgba(212,175,55,0.3)]'} rounded-2xl md:rounded-3xl transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 py-4 md:py-5 border border-white/20 disabled:opacity-50`}
          >
            <span className={`text-lg md:text-xl font-black tracking-tight ${isLastQuestion ? 'text-white' : 'text-black'}`}>
               {question.isAI ? 'سؤال عشوائي' : (isLastQuestion ? 'ختام السلسلة' : 'السؤال التالي')}
            </span>
            {isLastQuestion ? (
              <Check size={24} className="text-white" />
            ) : (
              <ChevronLeft size={24} className={`group-hover:-translate-x-1 transition-transform ${isLastQuestion ? 'text-white' : 'text-black'}`} />
            )}
          </button>
        </div>
        {copied && <span className="mt-2 text-[10px] font-bold text-green-400 animate-pulse pointer-events-none">تم نسخ السؤال للمشاركة ✨</span>}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.15);
          border-radius: 10px;
        }
        @media (max-height: 500px) and (orientation: landscape) {
          .landscape-scroll-fix {
            padding-top: 1rem;
            padding-bottom: 7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QuestionCard;

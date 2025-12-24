
import React, { useState, useEffect, useRef } from 'react';
import { Award, Clock, Sparkles, ChevronRight, CheckCircle2, RefreshCcw, Eye, LayoutGrid, Target, Zap, TrendingUp, BookOpen } from 'lucide-react';
import { feedback } from '../utils/feedback';
import { Series, Question } from '../types';

interface SoloRoomProps {
  onBack: () => void;
  series: Series;
  questions: Question[];
}

interface UserResult {
  question: Question;
  selectedIdx: number;
  isCorrect: boolean;
  pointsEarned: number;
}

const SoloRoom: React.FC<SoloRoomProps> = ({ onBack, series, questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showOptionsText, setShowOptionsText] = useState(false);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  const currentQuestion: Question = questions[currentQuestionIndex] || { 
    id: 'end-session',
    seriesId: series.id,
    text: "انتهت الجلسة", 
    options: ["-", "-", "-", "-"],
    correctIndex: 0
  };

  useEffect(() => {
    if (questions.length > 0 && !isGameOver) {
        startTimer();
    }
    return () => {
      stopTimer();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [currentQuestionIndex, questions.length, isGameOver]);

  const startTimer = () => {
    stopTimer();
    setTimeLeft(60);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { 
          stopTimer(); 
          setIsGameOver(true);
          return 0; 
        }
        return p - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      setIsGameOver(true);
      return;
    }
    setUserChoice(null);
    setShowResult(false);
    setShowOptionsText(false);
    setCurrentQuestionIndex(p => p + 1);
    feedback.playTransition();
  };

  const handleChoice = (num: number) => {
    if (isGameOver || userChoice !== null || showResult) return;
    
    if (!showOptionsText) {
        feedback.haptic(10);
        return;
    }

    const choiceIdx = num - 1;
    const isCorrect = choiceIdx === currentQuestion.correctIndex;
    
    // حساب النقاط: 10 أساسية + مكافأة سرعة (ثانية واحدة = نقطة إضافية، بحد أقصى 20 إضافية)
    const speedBonus = isCorrect ? Math.min(Math.floor(timeLeft / 3), 20) : 0;
    const totalPoints = isCorrect ? 10 + speedBonus : 0;

    feedback.playClick();
    setUserChoice(num);
    stopTimer();
    
    if (isCorrect) {
      setScore(p => p + totalPoints);
      feedback.playSuccess();
    } else {
      feedback.haptic(30);
    }

    setUserResults(prev => [...prev, {
      question: currentQuestion,
      selectedIdx: choiceIdx,
      isCorrect: isCorrect,
      pointsEarned: totalPoints
    }]);

    setShowResult(true);

    transitionTimeoutRef.current = window.setTimeout(() => {
      goToNextQuestion();
    }, 2000);
  };

  // دالة تحديد اللقب بناءً على النتيجة
  const getRank = (finalScore: number) => {
    const maxPossible = questions.length * 30; // افتراض أقصى نقاط هي 30 لكل سؤال
    const ratio = finalScore / maxPossible;
    if (ratio >= 0.8) return { label: "حكيم متبحر", color: "text-[#d4af37]" };
    if (ratio >= 0.5) return { label: "مفكر لبيب", color: "text-[#ff4d6d]" };
    if (ratio >= 0.2) return { label: "باحث شغوف", color: "text-[#a0c4ff]" };
    return { label: "متأمل صاعد", color: "text-white/40" };
  };

  if (isGameOver || questions.length === 0) {
    const rank = getRank(score);
    const correctCount = userResults.filter(r => r.isCorrect).length;
    
    return (
      <div className="flex flex-col items-center min-h-screen bg-[#050505] p-6 md:p-12 animate-in fade-in duration-700 overflow-y-auto w-full custom-scrollbar" dir="rtl">
        
        {/* Header Dashboard */}
        <div className="w-full max-w-5xl mb-12 relative">
          <div className="absolute inset-0 bg-[#d4af37]/5 blur-[100px] rounded-full"></div>
          <div className="relative glass-card rounded-[3rem] p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
             <div className="flex flex-col items-center md:items-start text-center md:text-right">
                <span className="text-white/20 text-xs font-black uppercase tracking-[0.4em] mb-2">الرتبة المستحقة</span>
                <h2 className={`text-4xl md:text-6xl font-black font-amiri ${rank.color} drop-shadow-lg`}>{rank.label}</h2>
             </div>
             
             <div className="flex gap-4 md:gap-10">
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#d4af37] mb-3">
                      <Zap size={28} />
                   </div>
                   <span className="text-3xl font-black text-white font-mono">{score}</span>
                   <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">إجمالي النقاط</span>
                </div>
                <div className="w-[1px] h-16 bg-white/5 self-center"></div>
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-green-500 mb-3">
                      <Target size={28} />
                   </div>
                   <span className="text-3xl font-black text-white font-mono">{Math.round((correctCount / questions.length) * 100)}%</span>
                   <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">دقة الإجابة</span>
                </div>
             </div>
          </div>
        </div>
        
        {/* Detailed Results List */}
        <div className="w-full max-w-4xl space-y-6 mb-32 relative z-10">
           <div className="flex items-center gap-4 mb-8 px-4">
              <BookOpen size={20} className="text-[#d4af37]" />
              <h3 className="text-xl font-bold text-white/40 font-amiri">سجل المزامنة الفكرية</h3>
           </div>
           
           {userResults.map((res, idx) => (
             <div key={idx} className={`glass-card p-8 md:p-10 rounded-[2.5rem] border ${res.isCorrect ? 'border-green-500/10' : 'border-red-500/10'} hover:bg-white/[0.02] transition-all duration-500 group`}>
                <div className="flex justify-between items-start mb-6">
                   <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">الموقف {idx + 1}</span>
                   {res.isCorrect && (
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <TrendingUp size={12} className="text-green-500" />
                        <span className="text-[10px] font-black text-green-500">+{res.pointsEarned}</span>
                     </div>
                   )}
                </div>
                
                <p className="text-white font-bold mb-8 font-amiri text-2xl md:text-3xl text-right leading-relaxed tracking-wide group-hover:text-[#d4af37] transition-colors">
                  {res.question.text}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className={`p-6 rounded-2xl text-right flex justify-between items-center transition-all ${res.isCorrect ? 'bg-green-500/5 text-green-400 border border-green-500/10' : 'bg-red-500/5 text-red-400 border border-red-500/10'}`}>
                      <span className="font-bold text-lg md:text-xl font-readex leading-relaxed">{res.question.options[res.selectedIdx]}</span>
                      <span className="text-[9px] uppercase font-black opacity-30 mr-6 whitespace-nowrap">قرارك</span>
                   </div>
                   {!res.isCorrect && (
                     <div className="p-6 rounded-2xl bg-white/[0.03] text-white/60 text-right flex justify-between items-center border border-white/5">
                        <span className="font-bold text-lg md:text-xl font-readex leading-relaxed">{res.question.options[res.question.correctIndex!]}</span>
                        <span className="text-[9px] uppercase font-black opacity-30 mr-6 whitespace-nowrap">الصواب</span>
                     </div>
                   )}
                </div>
             </div>
           ))}
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-black via-black/90 to-transparent z-50">
           <button onClick={onBack} className="group px-16 py-7 rounded-full bg-gradient-to-r from-[#d4af37] to-[#bf953f] text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-all flex items-center gap-4 shadow-[0_25px_50px_rgba(212,175,55,0.3)] active:scale-95">
             <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-700" /> 
             العودة للمسارات الذكية
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#1a080a] p-4 md:p-8 font-readex animate-in fade-in duration-1000 overflow-hidden relative" dir="rtl">
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-[#4a0404] to-[#1a080a] opacity-60"></div>
      </div>

      <header className="w-full text-center py-6 z-20 flex items-center justify-between px-4 max-w-7xl mx-auto">
         <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-[#d4af37] shadow-xl">
            <LayoutGrid size={24} />
         </div>
         <h1 className="text-white text-2xl md:text-4xl font-bold font-amiri tracking-wide text-gradient-gold drop-shadow-xl">
            {series.name}
         </h1>
         <button onClick={onBack} className="p-3 text-white/20 hover:text-white transition-colors active:scale-90">
            <ChevronRight size={32} />
         </button>
      </header>

      <div className="w-full max-w-4xl px-4 z-10 mb-8">
        <div className="w-full bg-black/40 backdrop-blur-3xl rounded-[2.5rem] py-6 flex items-center justify-between px-10 border border-white/5 shadow-2xl">
           <div className="flex items-center gap-5">
              <div className="relative">
                 {timeLeft < 15 && <div className="absolute inset-0 bg-red-500/20 blur-xl animate-ping rounded-full"></div>}
                 <Clock size={28} className={`${timeLeft < 15 ? 'text-red-500 animate-pulse' : 'text-[#d4af37]'} relative z-10`} />
              </div>
              <span className={`text-3xl font-mono font-black ${timeLeft < 15 ? 'text-red-500' : 'text-white'}`}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </span>
           </div>
           
           <div className="flex flex-col items-center">
              <span className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase mb-1">المرحلة</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-white font-black text-2xl">{currentQuestionIndex + 1}</span>
                 <span className="text-white/20 text-xs">/ {questions.length}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-5">
              <div className="flex flex-col items-end">
                <span className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase mb-1">النقاط</span>
                <span className="text-[#d4af37] font-black text-3xl font-mono">{score}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl flex flex-col justify-center items-center px-4 z-10 mb-10">
        <div className={`w-full glass-card rounded-[4rem] p-10 md:p-16 flex flex-col items-center justify-center border transition-all duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden text-center min-h-[350px] ${showResult ? (userChoice && userChoice-1 === currentQuestion.correctIndex ? 'border-green-500/40 bg-green-500/[0.03]' : 'border-red-500/40 bg-red-500/[0.03]') : 'border-white/5'}`}>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
           
           <h2 className={`text-white font-bold leading-loose font-amiri transition-all duration-500 drop-shadow-2xl z-10 ${currentQuestion.text.length > 80 ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'}`}>
             {currentQuestion.text}
           </h2>
           
           {!showOptionsText && !showResult && (
             <button 
                onClick={() => { feedback.playClick(); setShowOptionsText(true); }}
                className="mt-14 group relative px-16 py-7 rounded-full bg-[#d4af37] text-black font-black text-xl flex items-center gap-5 hover:scale-105 transition-all shadow-2xl overflow-hidden active:scale-95"
             >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Eye size={26} /> 
                <span className="relative z-10">استكشاف الخيارات</span>
             </button>
           )}
        </div>
      </div>

      <div className="w-full max-w-6xl px-4 z-10 pb-12">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((num) => {
              const idx = num - 1;
              const isSelected = userChoice === num;
              const isCorrect = idx === currentQuestion.correctIndex;
              const optionText = currentQuestion.options[idx] || "---";

              return (
                <button
                  key={num}
                  disabled={!showOptionsText || userChoice !== null || showResult}
                  onClick={() => handleChoice(num)}
                  className={`group h-28 md:h-32 rounded-[2.5rem] px-10 flex items-center justify-between border transition-all duration-500 transform active:scale-95 overflow-hidden relative shadow-2xl ${
                    showResult 
                      ? isCorrect 
                        ? 'bg-green-500/20 border-green-500/60 text-green-400 scale-[1.03] z-20 shadow-green-500/10' 
                        : isSelected 
                          ? 'bg-red-500/20 border-red-500/60 text-red-400 opacity-100' 
                          : 'bg-black/80 border-white/5 text-white/5 blur-sm opacity-20'
                      : !showOptionsText
                        ? 'bg-white/5 border-white/5 text-white/10 cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'bg-[#d4af37] text-black border-white z-10 scale-105'
                          : 'bg-black/60 text-white/50 border-white/10 hover:border-[#d4af37]/40 hover:text-white hover:bg-black/80'
                  }`}
                >
                  <span className={`text-3xl font-black font-mono relative z-10 ${isSelected || (showResult && isCorrect) ? '' : 'text-[#d4af37]'}`}>
                    {num}
                  </span>
                  
                  <div className="flex-1 px-6 text-right overflow-hidden">
                    <span className={`text-lg md:text-2xl font-bold font-readex relative z-10 leading-relaxed block transition-all duration-700 ${showOptionsText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 blur-md'}`}>
                      {optionText}
                    </span>
                  </div>
                  
                  {isSelected && <CheckCircle2 size={30} className="text-black shrink-0 relative z-10" />}
                  {showResult && isCorrect && <Sparkles size={24} className="text-green-400 absolute top-4 left-4 animate-pulse" />}
                </button>
              );
            })}
         </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(45, 10, 15, 0.5);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
        }
        .text-gradient-gold {
          background: linear-gradient(135deg, #f9f1d0 0%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default SoloRoom;

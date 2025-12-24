
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2, Award, Heart, User, Zap, Clock, Sparkles, CheckCircle2, XCircle, Share2, MessageSquareQuote } from 'lucide-react';
import { feedback } from '../utils/feedback';
import { Series, Question } from '../types';
import { GoogleGenAI } from "@google/genai";

interface OnlineRoomProps {
  roomId: string;
  onBack: () => void;
  isHost: boolean;
  series: Series;
  questions: Question[];
}

const OnlineRoom: React.FC<OnlineRoomProps> = ({ roomId, onBack, isHost, series, questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [user1Choice, setUser1Choice] = useState<number | null>(null);
  const [user2Choice, setUser2Choice] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMatch, setIsMatch] = useState(false);
  const [matchesCount, setMatchesCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPartnerInRoom, setIsPartnerInRoom] = useState(false);
  const [lastPartnerPing, setLastPartnerPing] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  
  // AI Analysis States
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  const currentQuestion: Question = questions[currentQuestionIndex] || { 
    id: 'end',
    seriesId: series.id,
    text: "انتهت الجلسة",
    options: ["-", "-", "-", "-"]
  };

  useEffect(() => {
    const channelName = `ashwaq_room_${roomId}`;
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, choice, analysis } = event.data;
      
      if (type === 'PARTNER_CHOICE') {
        if (isHost) setUser2Choice(choice);
        else setUser1Choice(choice);
      } else if (type === 'ROOM_HEARTBEAT') {
        if (!isPartnerInRoom) setIsSyncing(false);
        setIsPartnerInRoom(true);
        setLastPartnerPing(Date.now());
      } else if (type === 'AI_ANALYSIS_SYNC') {
        setAiAnalysis(analysis);
        setIsAnalyzing(false);
      }
    };

    const roomHb = setInterval(() => {
      channel.postMessage({ type: 'ROOM_HEARTBEAT' });
    }, 1000);

    const checkConnection = setInterval(() => {
      if (Date.now() - lastPartnerPing > 4000) {
        setIsPartnerInRoom(false);
      }
    }, 2000);

    return () => {
      clearInterval(roomHb);
      clearInterval(checkConnection);
      stopTimer();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      channel.close();
    };
  }, [roomId, isHost, series, lastPartnerPing, isPartnerInRoom]);

  useEffect(() => {
    if (isPartnerInRoom && !isGameOver && !isSyncing) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isPartnerInRoom, currentQuestionIndex, isGameOver, isSyncing]);

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

  const generateAIAnalysis = async (finalMatches: number) => {
    if (!isHost) return; // المستضيف هو من يولد التحليل لضمان التطابق
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `بصفتك محلل مشاعر في لعبة "أشواق"، حلل هذه النتيجة:
        السلسلة: ${series.name}
        عدد الأسئلة الكلي: ${questions.length}
        عدد مرات التطابق: ${finalMatches}
        اكتب فقرة شاعريّة وعميقة جداً باللغة العربية تصف التناغم بين الطرفين. 
        إذا كان التطابق عالياً، ركز على وحدة الروح. إذا كان منخفضاً، ركز على جمال الاختلاف وتكامل الزوايا.
        اجعل النص قصيراً ومؤثراً (بين 20 إلى 40 كلمة).`,
      });

      const analysisText = response.text || "تناغم يفيض بالسحر والجمال.";
      setAiAnalysis(analysisText);
      channelRef.current?.postMessage({ type: 'AI_ANALYSIS_SYNC', analysis: analysisText });
    } catch (e) {
      console.error(e);
      setAiAnalysis("أرواح تلتقي في فضاء العاطفة لتشكل لوحة فريدة من نوعها.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      setIsGameOver(true);
      generateAIAnalysis(matchesCount + (isMatch ? 1 : 0));
      return;
    }
    setUser1Choice(null);
    setUser2Choice(null);
    setIsMatch(false);
    setShowResult(false);
    setCurrentQuestionIndex(p => p + 1);
    feedback.playTransition();
  };

  useEffect(() => {
    if (user1Choice !== null && user2Choice !== null) {
      stopTimer();
      const match = user1Choice === user2Choice;
      setIsMatch(match);
      if (match) {
        setMatchesCount(p => p + 1);
        feedback.playSuccess();
      } else {
        feedback.haptic(20);
      }
      setShowResult(true);

      transitionTimeoutRef.current = window.setTimeout(() => {
        goToNextQuestion();
      }, 1500);
    }
  }, [user1Choice, user2Choice]);

  const handleChoice = (num: number) => {
    if (isGameOver || !isPartnerInRoom || isSyncing || (isHost ? user1Choice : user2Choice) !== null) return;
    feedback.playClick();
    if (isHost) setUser1Choice(num); else setUser2Choice(num);
    channelRef.current?.postMessage({ type: 'PARTNER_CHOICE', choice: num });
  };

  if (isGameOver) {
    const matchPercentage = Math.round((matchesCount / (questions.length || 1)) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 md:p-10 text-center animate-in zoom-in duration-1000 bg-[#050505] overflow-y-auto w-full custom-scrollbar" dir="rtl">
        <header className="mb-10">
          <Award size={100} className="text-[#d4af37] mx-auto mb-6 animate-bounce" />
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-2 font-amiri tracking-tight">فيض التناغم</h2>
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.5em]">The AI Connectivity Report</p>
        </header>

        <div className="w-full max-w-4xl space-y-8 mb-20">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="glass-card p-10 rounded-[3rem] border border-[#ff4d6d]/20 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4d6d] to-transparent opacity-30"></div>
                  <span className="text-[10px] text-white/20 block mb-4 uppercase font-black tracking-widest">نسبة الاندماج</span>
                  <div className="text-7xl font-black text-[#ff4d6d] font-mono group-hover:scale-110 transition-transform duration-700">{matchPercentage}%</div>
              </div>
              <div className="glass-card p-10 rounded-[3rem] border border-[#d4af37]/20 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-30"></div>
                  <span className="text-[10px] text-white/20 block mb-4 uppercase font-black tracking-widest">نقاط الارتباط</span>
                  <div className="text-7xl font-black text-[#d4af37] font-mono group-hover:scale-110 transition-transform duration-700">{matchesCount * 10}</div>
              </div>
            </div>

            {/* AI Analysis Box */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/10 to-[#ff4d6d]/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative glass-card p-8 md:p-12 rounded-[4rem] border border-white/5 flex flex-col items-center text-center">
                <div className="flex items-center gap-3 mb-8 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                  <Sparkles size={16} className="text-[#d4af37] animate-pulse" />
                  <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.4em]">تحليل التناغم الذكي</span>
                </div>
                
                {isAnalyzing ? (
                  <div className="flex flex-col items-center py-10">
                    <Loader2 className="animate-spin text-white/20 mb-4" size={40} />
                    <p className="text-white/20 italic font-amiri text-xl">جاري استنطاق لغة القلوب...</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <MessageSquareQuote size={40} className="text-white/5 mx-auto mb-4" />
                    <p className="text-white font-bold text-2xl md:text-3xl leading-relaxed font-amiri px-4">
                      {aiAnalysis || "أرواح تلتقي في فضاء العاطفة لتشكل لوحة فريدة من نوعها."}
                    </p>
                    <div className="pt-8 flex justify-center gap-4">
                       <button className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-bold hover:text-[#d4af37] transition-all">
                          <Share2 size={14} /> مشاركة التحليل
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>

        <button onClick={onBack} className="group relative px-20 py-7 rounded-full bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-[#d4af37] hover:text-black transition-all shadow-2xl active:scale-95 overflow-hidden">
           <span className="relative z-10">العودة للرئيسية</span>
           <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#bf953f] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    );
  }

  if (!isPartnerInRoom || isSyncing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-12 text-center animate-in fade-in">
         <div className="relative">
            <div className="absolute inset-0 bg-[#d4af37]/10 blur-[80px] animate-pulse"></div>
            <Loader2 size={80} className="text-[#d4af37] animate-spin mb-8 relative z-10" />
         </div>
         <h2 className="text-4xl font-bold text-white mb-6 font-amiri tracking-tight relative z-10">مزامنة الترددات الرقمية...</h2>
         <p className="text-white/20 text-lg relative z-10">ننتظر اكتمال جسر الاتصال بينكما</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#050505] p-6 md:p-10 font-readex animate-in fade-in duration-1000 overflow-x-hidden relative" dir="rtl">
      
      {/* HUD */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-12 relative z-10">
         <div className={`flex items-center gap-6 glass-card px-8 py-4 rounded-3xl border ${user2Choice ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'} transition-all duration-500`}>
            <User size={24} className={user2Choice ? 'text-green-500' : 'text-white/20'} />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{isHost ? 'الشريك' : 'أنت'}</span>
              <span className="text-[11px] text-white/10 font-bold">{user2Choice ? 'قرر' : 'يفكر...'}</span>
            </div>
         </div>

         <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-white tracking-tighter">
              <span className="text-[#d4af37]">{currentQuestionIndex + 1}</span>
              <span className="text-white/5 mx-2">/</span>
              <span className="text-white/20">{questions.length}</span>
            </div>
            <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.5em] mt-2 animate-pulse">{series.name}</span>
         </div>

         <div className={`flex items-center gap-6 glass-card px-8 py-4 rounded-3xl border ${user1Choice ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'} transition-all duration-500`}>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{isHost ? 'أنت' : 'المستضيف'}</span>
              <span className="text-[11px] text-white/10 font-bold">{user1Choice ? 'قررت' : 'تفكير...'}</span>
            </div>
            <User size={24} className={user1Choice ? 'text-green-500' : 'text-white/20'} />
         </div>
      </div>

      {/* Main Panel */}
      <div className="w-full max-w-6xl glass-card rounded-[4rem] p-12 md:p-20 flex flex-col items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden text-center min-h-[400px] mb-12">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#d4af37]/5 to-transparent pointer-events-none"></div>
           
           {showResult ? (
             <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center relative z-10">
                {isMatch ? (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                       <div className="absolute inset-0 bg-green-500/20 blur-3xl animate-pulse"></div>
                       <CheckCircle2 size={100} className="text-green-500 relative z-10" />
                    </div>
                    <h2 className="text-5xl font-bold text-white font-amiri">تطابق مذهل</h2>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-6">
                    <XCircle size={100} className="text-red-500/20" />
                    <h2 className="text-4xl font-bold text-white/20 font-amiri italic">اختلاف يثري الحوار</h2>
                  </div>
                )}
             </div>
           ) : (
             <h2 className="text-white text-3xl md:text-5xl font-bold leading-relaxed font-amiri px-4 relative z-10 drop-shadow-lg">
               {currentQuestion.text}
             </h2>
           )}
      </div>

      {/* Answers */}
      <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16">
        {[1, 2, 3, 4].map((num) => {
          const idx = num - 1;
          const isSelected = isHost ? user1Choice === num : user2Choice === num;
          const optionText = currentQuestion.options[idx] || "---";
          
          return (
            <button
              key={num}
              disabled={(isHost ? user1Choice : user2Choice) !== null || showResult}
              onClick={() => handleChoice(num)}
              className={`group h-32 rounded-[2.5rem] px-6 transition-all transform active:scale-95 flex flex-col items-center justify-center border relative overflow-hidden shadow-xl ${
                isSelected
                ? 'bg-[#d4af37] text-black border-white scale-105 z-20 shadow-[0_20px_40px_rgba(212,175,55,0.3)]'
                : 'bg-black/40 text-white/40 border-white/5 hover:border-[#d4af37]/30'
              }`}
            >
              <span className="text-2xl font-black font-mono mb-2">{num}</span>
              <span className="text-xs font-bold font-readex text-center line-clamp-2">{optionText}</span>
              {isSelected && <div className="absolute top-2 right-4 text-[8px] font-black uppercase tracking-widest opacity-40">اختيارك</div>}
            </button>
          );
        })}
      </div>

      <footer className="mt-auto pb-10">
         <div className="flex items-center gap-6 bg-white/5 px-10 py-4 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
            <Clock size={20} className={`${timeLeft < 15 ? 'text-red-500 animate-pulse' : 'text-[#d4af37]'}`} />
            <span className={`text-3xl font-mono font-black ${timeLeft < 15 ? 'text-red-500' : 'text-white'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
         </div>
      </footer>
    </div>
  );
};

export default OnlineRoom;

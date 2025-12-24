
import React, { useEffect, useRef, useState } from 'react';
import { Plus, Search, Copy, Wifi, ArrowRight, Loader2, ArrowLeft, Play, Sparkles, Key, Star, Diamond, Sparkle, Globe, UserPlus } from 'lucide-react';
import { OnlineView, Orientation, Series, Question } from '../types';
import { feedback } from '../utils/feedback';
import { ONLINE_SERIES } from '../constants';
import OnlineRoom from './OnlineRoom';
import { GoogleGenAI, Type } from "@google/genai";

interface OnlineGameProps {
  onBack: () => void;
  orientation: Orientation;
  view: OnlineView;
  setView: (view: OnlineView) => void;
  roomId: string;
  setRoomId: (id: string) => void;
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
  selectedSeries: Series | null;
  setSelectedSeries: (series: Series | null) => void;
}

const OnlineGame: React.FC<OnlineGameProps> = ({ 
  onBack, 
  orientation, 
  view, 
  setView, 
  roomId, 
  setRoomId, 
  isHost, 
  setIsHost, 
  selectedSeries, 
  setSelectedSeries 
}) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const viewRef = useRef<OnlineView>(view);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  useEffect(() => { viewRef.current = view; }, [view]);

  useEffect(() => {
    if (!roomId) return;

    const channelName = `ashwaq_room_${roomId}`;
    if (channelRef.current) channelRef.current.close();
    
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, series, questions } = event.data;
      const currentView = viewRef.current;

      if (isHost) {
        if (type === 'PARTNER_PING' && currentView === OnlineView.LOBBY) {
          feedback.playSuccess();
          setView(OnlineView.SELECT_SERIES);
        }
      } else {
        if (type === 'HOST_ACK' && currentView === OnlineView.JOIN) {
          feedback.playSuccess();
          setView(OnlineView.WAITING_FOR_HOST);
        }
        if (type === 'SERIES_DATA') {
          setSelectedSeries(series);
          if (questions) {
            setGeneratedQuestions(questions);
            setTimeout(() => setView(OnlineView.ROOM), 800);
          }
        }
      }
    };

    const heartbeat = setInterval(() => {
      if (!channelRef.current) return;
      if (!isHost) {
        if (viewRef.current === OnlineView.JOIN || viewRef.current === OnlineView.WAITING_FOR_HOST) {
          channelRef.current.postMessage({ type: 'PARTNER_PING' });
        }
      } else {
        if (selectedSeries && generatedQuestions.length > 0) {
          channelRef.current.postMessage({ 
            type: 'SERIES_DATA', 
            series: selectedSeries,
            questions: generatedQuestions
          });
        }
      }
    }, 800);

    return () => {
      clearInterval(heartbeat);
      channel.close();
      channelRef.current = null;
    };
  }, [roomId, isHost, selectedSeries, setView, setSelectedSeries, generatedQuestions]);

  const generateRoomId = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const newId = `ASH-${num}`;
    setIsHost(true);
    setRoomId(newId);
    setView(OnlineView.LOBBY);
    feedback.playClick();
  };

  const handleJoin = (id: string) => {
    if (id.length < 3) return;
    setIsHost(false);
    const formattedId = id.startsWith('ASH-') ? id : `ASH-${id}`;
    setRoomId(formattedId);
    feedback.playClick();
  };

  const handleSelectSeries = async (series: Series) => {
    feedback.playClick();
    setIsGenerating(true);
    setSelectedSeries(series);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت خبير في العلاقات الإنسانية. ولد 10 مواقف/أسئلة عميقة لسلسلة "${series.name}".
        وصف السلسلة: ${series.description}.
        لكل سؤال، قدم 4 خيارات (واحد صحيح ومنطقي).
        يجب أن يكون المحتوى باللغة العربية الفصحى الراقية.`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4
                },
                correctIndex: { type: Type.INTEGER }
              },
              required: ['text', 'options', 'correctIndex']
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      const questions: Question[] = data.map((item: any, idx: number) => ({
        id: `online-${roomId}-${idx}-${Date.now()}`,
        seriesId: series.id,
        text: item.text,
        options: item.options,
        correctIndex: item.correctIndex
      }));

      setGeneratedQuestions(questions);
      // سيقوم الهارت بيت بإرسال البيانات للطرف الآخر
      setView(OnlineView.ROOM);
      feedback.playSuccess();
    } catch (error) {
      console.error("Online AI Generation Error:", error);
      alert("حدث خطأ في مزامنة البيانات عبر الذكاء الاصطناعي.");
      setSelectedSeries(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const isLandscape = orientation === Orientation.LANDSCAPE;

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-12 text-center animate-in fade-in">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#d4af37]/10 blur-3xl animate-pulse"></div>
          <Loader2 size={80} className="text-[#d4af37] animate-spin relative z-10" />
        </div>
        <h2 className="text-3xl font-bold text-gradient-gold font-amiri mb-4">جاري مزامنة الترددات عبر الذكاء الاصطناعي...</h2>
        <p className="text-white/30 text-sm max-w-xs leading-relaxed">نقوم الآن بتصميم جلسة فريدة وحصرية لكما.</p>
      </div>
    );
  }

  // FIXED: Changed 'series' to 'selectedSeries' to fix the "Cannot find name 'series'" error.
  if (view === OnlineView.ROOM && selectedSeries) {
    return <OnlineRoom roomId={roomId} onBack={onBack} isHost={isHost} series={selectedSeries} questions={generatedQuestions} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full max-w-7xl mx-auto animate-in fade-in duration-700 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#9b1c31]/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#d4af37]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className={`w-full relative z-10 transition-all duration-700 ${isLandscape ? 'max-w-6xl' : 'max-w-xl'}`}>
        
        {view === OnlineView.ENTRY && (
          <div className="flex flex-col items-center gap-12 animate-in slide-in-from-bottom-12 duration-1000">
            <header className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                <Globe size={14} className="text-[#d4af37] animate-pulse" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em]">Global Sync Mode</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-bold text-gradient-gold font-amiri tracking-tight drop-shadow-2xl py-2">أشواق A1</h1>
              <p className="text-white/30 text-lg md:text-xl font-light italic tracking-wide max-w-md mx-auto">ارتباط رقمي يتجاوز حدود المسافات</p>
            </header>

            <div className={`grid gap-8 w-full ${isLandscape ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <button 
                onClick={generateRoomId} 
                className="group relative glass-card p-10 md:p-14 rounded-[3.5rem] border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all duration-500 flex flex-col items-center text-center shadow-2xl active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#d4af37]/20 to-[#bf953f]/10 flex items-center justify-center mb-8 text-[#d4af37] group-hover:scale-110 transition-all border border-[#d4af37]/20 shadow-lg">
                  <UserPlus size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 font-amiri tracking-wide">إنشاء بوابة</h3>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-black">Host a New Connection</p>
              </button>

              <button 
                onClick={() => setView(OnlineView.JOIN)} 
                className="group relative glass-card p-10 md:p-14 rounded-[3.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col items-center text-center shadow-2xl active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="relative w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 text-white/30 group-hover:scale-110 group-hover:text-white transition-all border border-white/10 shadow-lg">
                  <Search size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 font-amiri tracking-wide">انضمام لبوابة</h3>
                <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-black">Sync Existing Frequency</p>
              </button>
            </div>

            <button onClick={onBack} className="group flex items-center gap-4 text-white/10 hover:text-white/40 transition-all font-black text-[10px] uppercase tracking-[0.6em] py-4">
               <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform duration-500" /> العودة للرئيسية
            </button>
          </div>
        )}

        {view === OnlineView.JOIN && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-700 w-full">
            <header className="mb-14 text-center">
               <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 font-amiri tracking-tight">أدخل رمز الغرفة</h2>
               <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-black">Synchronizing Identity</p>
            </header>

            <div className="w-full relative max-w-md mb-16">
              <div className="absolute -inset-10 bg-gradient-to-r from-[#d4af37]/20 to-[#9b1c31]/20 blur-[80px] opacity-30 animate-pulse"></div>
              <div className="relative glass-card rounded-[3rem] p-4 border border-white/10 overflow-hidden shadow-2xl">
                <input 
                  type="text" 
                  placeholder="ASH-0000"
                  autoFocus
                  maxLength={8}
                  value={roomId.replace('ASH-', '')}
                  onChange={(e) => handleJoin(e.target.value.toUpperCase())}
                  className="w-full bg-transparent py-10 px-8 text-center text-4xl md:text-5xl font-black text-[#d4af37] tracking-[0.15em] focus:outline-none shimmer-text font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-10">
               <div className="flex items-center gap-5 px-10 py-5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-inner">
                  <Loader2 className="animate-spin text-[#d4af37]" size={20} />
                  <span className="text-white/40 font-black text-[11px] uppercase tracking-[0.4em]">Searching for Waves...</span>
               </div>
               <button onClick={onBack} className="text-white/10 hover:text-white/60 text-[10px] font-black uppercase tracking-[0.6em] transition-all">إلغاء والمحاولة لاحقاً</button>
            </div>
          </div>
        )}

        {view === OnlineView.LOBBY && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 text-center w-full">
            <header className="mb-10">
              <span className="text-white/20 text-[11px] font-black uppercase tracking-[0.8em] mb-4 block">Session Private Key</span>
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mx-auto rounded-full"></div>
            </header>

            <div className="flex items-center gap-6 mb-16 group relative">
               <div className="absolute -inset-10 bg-[#d4af37]/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
               <div className="glass-card px-10 py-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 flex items-center gap-6 group-hover:border-[#d4af37]/20 transition-all">
                  <span className="text-4xl md:text-5xl font-black text-white tracking-widest shimmer-text font-mono drop-shadow-xl">{roomId}</span>
                  <div className="w-[1px] h-10 bg-white/10"></div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(roomId); feedback.playSuccess(); }} 
                    className="p-3 rounded-2xl bg-white/5 text-white/30 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all active:scale-90"
                    title="نسخ الرمز"
                  >
                    <Copy size={24} />
                  </button>
               </div>
            </div>
            
            <div className="w-full max-w-sm flex flex-col gap-8">
              <div className="glass-card px-8 py-6 rounded-[2.5rem] border border-[#d4af37]/20 flex items-center justify-center gap-4 animate-pulse shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#d4af37] to-[#9b1c31]"></div>
                 <Loader2 className="animate-spin text-[#d4af37]" size={20} />
                 <span className="text-[#d4af37] font-black tracking-widest text-base">بانتظار التحام الأرواح...</span>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { feedback.playClick(); setView(OnlineView.SELECT_SERIES); }}
                  className="group w-full py-6 rounded-[2.5rem] bg-gradient-to-r from-[#d4af37] to-[#bf953f] text-black font-black text-xl flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl active:scale-95 border border-white/20"
                >
                  <Play size={20} fill="currentColor" />
                  بدء التخصيص
                </button>
                <button onClick={onBack} className="text-white/10 hover:text-white/40 text-[10px] font-black uppercase tracking-[0.6em] transition-all py-2">إنهاء الجلسة</button>
              </div>
            </div>
          </div>
        )}

        {view === OnlineView.SELECT_SERIES && (
          <div className="flex flex-col items-center animate-in fade-in duration-1000 w-full">
             <header className="text-center mb-16 space-y-6">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 mb-4 backdrop-blur-md">
                  <Star size={14} className="text-[#d4af37] animate-spin-slow" />
                  <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.4em]">Royale Channels</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-bold text-gradient-gold font-amiri leading-relaxed py-4 block drop-shadow-2xl">
                   اختر وجهتكم
                </h2>
                <p className="text-white/30 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto leading-relaxed">
                  سيتم توليد محتوى ذكي وحصري لكما فور الاختيار.
                </p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-20">
                {ONLINE_SERIES.map((s, idx) => (
                  <button 
                    key={s.id} 
                    onClick={() => handleSelectSeries(s)} 
                    className="group relative glass-card p-1 md:p-1.5 rounded-[4rem] transition-all duration-700 hover:-translate-y-3 active:scale-[0.98] overflow-hidden"
                  >
                     <div className="relative glass-card rounded-[3.8rem] p-10 md:p-12 flex flex-col h-full border border-white/5 group-hover:border-[#d4af37]/40 transition-all duration-500 overflow-hidden">
                        <div className="flex items-start justify-between mb-10 z-10">
                           <div className="w-20 h-20 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37]/40 transition-all duration-500 shadow-2xl">
                              <span className="relative z-10">{s.icon}</span>
                           </div>
                        </div>

                        <div className="flex flex-col text-right z-10 mt-auto">
                            <h4 className="text-4xl md:text-5xl font-bold text-white group-hover:text-[#d4af37] transition-all duration-500 leading-tight font-amiri mb-4">
                               {s.name}
                            </h4>
                           <p className="text-white/30 text-base font-medium group-hover:text-white/70 transition-all duration-500 leading-relaxed mb-10 line-clamp-2">
                              {s.description}
                           </p>
                           <div className="flex items-center justify-end">
                              <div className="flex items-center gap-3 text-[10px] font-black text-white/10 group-hover:text-[#d4af37] uppercase tracking-[0.4em] transition-all duration-500 bg-white/5 px-6 py-3 rounded-full border border-transparent group-hover:border-[#d4af37]/20">
                                 توليد المسار الذكي <ArrowRight size={16} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </button>
                ))}
             </div>
             <button onClick={onBack} className="text-white/10 hover:text-[#d4af37] font-black text-[10px] uppercase tracking-[0.8em] py-4 flex items-center gap-4">
                <ArrowLeft size={16} /> العودة لرمز الغرفة
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineGame;

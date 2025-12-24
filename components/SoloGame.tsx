
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Star, User, Play, Loader2, Sparkles } from 'lucide-react';
import { Orientation, Series, SoloView, Question } from '../types';
import { feedback } from '../utils/feedback';
import { A3_SERIES } from '../constants';
import SoloRoom from './SoloRoom';
import { GoogleGenAI, Type } from "@google/genai";

interface SoloGameProps {
  onBack: () => void;
  orientation: Orientation;
  view: SoloView;
  setView: (view: SoloView) => void;
  selectedSeries: Series | null;
  setSelectedSeries: (series: Series | null) => void;
}

const SoloGame: React.FC<SoloGameProps> = ({ 
  onBack, 
  orientation, 
  view, 
  setView, 
  selectedSeries, 
  setSelectedSeries 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const handleSelectSeries = async (series: Series) => {
    feedback.playClick();
    setIsGenerating(true);
    setSelectedSeries(series);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت خبير في ${series.name}. ولد 10 مواقف واقعية وفريدة لهذه السلسلة.
        وصف السلسلة: ${series.description}.
        لكل موقف، قدم 4 خيارات (واحد فقط صحيح ومنطقي وعلمي). 
        يجب أن تكون الأسئلة بأسلوب راقٍ وباللغة العربية الفصحى. 
        لا تكرر المواقف السابقة أبداً.`,
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
                correctIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" }
              },
              required: ['text', 'options', 'correctIndex']
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      const questions: Question[] = data.map((item: any, idx: number) => ({
        id: `solo-${series.id}-${idx}-${Date.now()}`,
        seriesId: series.id,
        text: item.text,
        options: item.options,
        correctIndex: item.correctIndex
      }));

      setGeneratedQuestions(questions);
      setView(SoloView.ROOM);
      feedback.playSuccess();
    } catch (error) {
      console.error("Solo Generation Error:", error);
      alert("عذراً، حدث خطأ أثناء تحضير الجلسة. يرجى المحاولة مرة أخرى.");
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
        <h2 className="text-3xl font-bold text-gradient-gold font-amiri mb-4">نحن نعد لك تحدياً ذكياً...</h2>
        <p className="text-white/30 text-sm max-w-xs leading-relaxed">الذكاء الاصطناعي يقوم الآن بتصميم مواقف حصرية لسلسلة {selectedSeries?.name}</p>
      </div>
    );
  }

  if (view === SoloView.ROOM && selectedSeries) {
    return <SoloRoom onBack={() => { setView(SoloView.SELECT_SERIES); setGeneratedQuestions([]); }} series={selectedSeries} questions={generatedQuestions} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full max-w-7xl mx-auto animate-in fade-in duration-700 overflow-y-auto custom-scrollbar relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#4a0404]/5 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <div className={`w-full relative z-10 transition-all duration-700 max-w-6xl`}>
        {view === SoloView.ENTRY && (
          <div className="flex flex-col items-center gap-12 animate-in slide-in-from-bottom-12 duration-1000 py-12">
            <header className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                <User size={14} className="text-[#d4af37] animate-pulse" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em]">Solo Smart Mode A3</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-bold text-gradient-gold font-amiri tracking-tight drop-shadow-2xl py-2">أشواق الذات</h1>
              <p className="text-white/30 text-lg md:text-xl font-light italic tracking-wide max-w-md mx-auto leading-relaxed">تحديات فكرية واجتماعية فريدة يتم توليدها ذكياً في كل مرة</p>
            </header>

            <button 
              onClick={() => { feedback.playClick(); setView(SoloView.SELECT_SERIES); }}
              className="group relative glass-card p-12 md:p-20 rounded-[4rem] border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all duration-500 flex flex-col items-center text-center shadow-2xl active:scale-95 overflow-hidden w-full max-w-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#4a0404]/40 to-[#2d0a0f]/20 flex items-center justify-center mb-8 text-[#d4af37] group-hover:scale-110 transition-all border border-[#d4af37]/20 shadow-lg">
                <Sparkles size={48} className="text-[#d4af37]" />
              </div>
              <h3 className="text-4xl font-black text-white mb-2 font-amiri tracking-wide">ابدأ تجربة ذكية</h3>
              <p className="text-white/20 text-[11px] uppercase tracking-[0.4em] font-black">AI-Powered Individual Sessions</p>
            </button>

            <button onClick={onBack} className="group flex items-center gap-4 text-white/10 hover:text-white/40 transition-all font-black text-[10px] uppercase tracking-[0.6em] py-4">
               <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform duration-500" /> العودة للرئيسية
            </button>
          </div>
        )}

        {view === SoloView.SELECT_SERIES && (
          <div className="flex flex-col items-center animate-in fade-in duration-1000 w-full py-12">
             <header className="text-center mb-16 space-y-6">
                <h2 className="text-5xl md:text-8xl font-bold text-gradient-gold font-amiri leading-relaxed block drop-shadow-2xl">اختر تخصصك</h2>
                <p className="text-white/30 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto">سيتم توليد مواقف جديدة وفريدة فور اختيارك لأي فئة.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-20">
                {A3_SERIES.map((s, idx) => (
                  <button 
                    key={s.id} 
                    onClick={() => handleSelectSeries(s)} 
                    className="group relative glass-card p-1 rounded-[2.5rem] transition-all duration-700 hover:-translate-y-2 active:scale-[0.98] overflow-hidden"
                  >
                     <div className="relative glass-card rounded-[2.3rem] p-6 md:p-8 flex flex-col h-full border border-white/5 group-hover:border-[#d4af37]/40 transition-all duration-500 text-right min-h-[220px]">
                        <div className="flex items-center justify-between mb-6 z-10">
                           <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-[#4a0404]/30 transition-all duration-500">
                              <span className="relative z-10">{s.icon}</span>
                           </div>
                        </div>
                        <div className="flex flex-col z-10 mt-auto">
                            <h4 className="text-2xl md:text-3xl font-bold text-white group-hover:text-[#d4af37] transition-all duration-500 mb-2 font-amiri">{s.name}</h4>
                            <p className="text-white/20 text-xs font-medium group-hover:text-white/50 transition-all duration-500 line-clamp-2">{s.description}</p>
                            <div className="flex items-center justify-end gap-3 text-[9px] font-black text-white/5 group-hover:text-[#d4af37] uppercase tracking-[0.3em] transition-all mt-4">
                                فتح المسار الذكي <ArrowRight size={14} />
                            </div>
                        </div>
                     </div>
                  </button>
                ))}
             </div>
             <button onClick={onBack} className="text-white/10 hover:text-[#d4af37] font-black text-[10px] uppercase tracking-[0.8em] py-4 flex items-center gap-4">
                <ArrowLeft size={16} /> العودة للبداية
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoloGame;

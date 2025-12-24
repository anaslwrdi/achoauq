
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GameView, Question, Series, Orientation, MainMode, OnlineView, SoloView } from './types';
import { QUESTIONS, SERIES, ONLINE_SERIES } from './constants';
import NumberGrid from './components/NumberGrid';
import QuestionCard from './components/QuestionCard';
import SeriesSelector from './components/SeriesSelector';
import RulesScreen from './components/RulesScreen';
import SeriesCompletedScreen from './components/SeriesCompletedScreen';
import ModeSelector from './components/ModeSelector';
import OnlineGame from './components/OnlineGame';
import SoloGame from './components/SoloGame'; 
import { MonitorPlay, Smartphone, Heart, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { feedback } from './utils/feedback';

const App: React.FC = () => {
  const [mainMode, setMainMode] = useState<MainMode>(MainMode.SELECTION);
  const [currentView, setCurrentView] = useState<GameView>(GameView.SERIES_SELECTION);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [favorites, setFavorites] = useState<Question[]>([]);
  const [orientation, setOrientation] = useState<Orientation>(Orientation.PORTRAIT);
  const [isGenerating, setIsGenerating] = useState(false);

  // Online states
  const [onlineView, setOnlineView] = useState<OnlineView>(OnlineView.ENTRY);
  const [onlineRoomId, setOnlineRoomId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [onlineSelectedSeries, setOnlineSelectedSeries] = useState<Series | null>(null);

  // Solo states (A3)
  const [soloView, setSoloView] = useState<SoloView>(SoloView.ENTRY);
  const [soloSelectedSeries, setSoloSelectedSeries] = useState<Series | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
    const savedFavs = localStorage.getItem('ashwaq_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedProgress = localStorage.getItem('ashwaq_progress');
    if (savedProgress) setSelectedIds(JSON.parse(savedProgress));
  }, []);

  useEffect(() => {
    localStorage.setItem('ashwaq_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ashwaq_progress', JSON.stringify(selectedIds));
  }, [selectedIds]);

  const filteredQuestions = useMemo(() => {
    if (!selectedSeries) return [];
    if (selectedSeries.id === 'ai') return [];
    return QUESTIONS
      .filter(q => q.seriesId === selectedSeries.id)
      .sort((a, b) => Number(a.id) - Number(b.id));
  }, [selectedSeries]);

  const handleSelectSeries = useCallback((series: Series) => {
    feedback.playClick();
    setSelectedSeries(series);
    setCurrentView(GameView.RULES);
  }, []);

  const generateAIQuestion = async () => {
    setIsGenerating(true);
    setCurrentView(GameView.AI_GENERATING);
    feedback.playTransition();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت أديب ومفكر مبدع في لعبة 'أشواق'. ولد سؤالاً عميقاً وفنياً جديداً كلياً باللغة العربية. يجب أن يغوص السؤال في الذاكرة، المشاعر، أو فلسفة الحياة العاطفية بأسلوب راقٍ وشاعري. تجنب الأسئلة المكررة أو السطحية.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: 'The poetic question text in Arabic.',
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '4 artistic multiple choice options.',
                }
              },
              required: ['text', 'options']
            },
            temperature: 0.9,
            thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const data = JSON.parse(response.text || '{}');
      const newQuestion: Question = {
        id: `ai-${Date.now()}`,
        seriesId: 'ai',
        text: data.text || 'عذراً، لم أستطع توليد سؤال شاعري في هذه اللحظة.',
        options: data.options || ['حاول مرة أخرى', 'تأمل في الصمت', 'انتظر قليلاً', 'ابحث في قلبك'],
        isAI: true
      };
      
      setSelectedQuestion(newQuestion);
      setCurrentView(GameView.QUESTION);
      feedback.playSuccess();
    } catch (error) {
      console.error("AI Generation Error:", error);
      setCurrentView(GameView.SERIES_SELECTION);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGame = useCallback(() => {
    feedback.playClick();
    if (selectedSeries?.id === 'ai') {
      generateAIQuestion();
    } else {
      setCurrentView(GameView.MENU);
    }
  }, [selectedSeries]);

  const handleSelectQuestion = useCallback((id: number | string) => {
    feedback.playClick();
    const q = filteredQuestions.find(item => item.id === id);
    if (q) {
      setSelectedQuestion(q);
      setCurrentView(GameView.QUESTION);
      if (!selectedIds.includes(id)) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  }, [filteredQuestions, selectedIds]);

  const handleNext = useCallback(() => {
    if (selectedSeries?.id === 'ai') {
      generateAIQuestion();
      return;
    }

    if (!selectedQuestion || !selectedSeries) return;

    const currentIndex = filteredQuestions.findIndex(q => q.id === selectedQuestion.id);
    
    if (currentIndex === filteredQuestions.length - 1) {
      feedback.playSuccess();
      setCurrentView(GameView.SERIES_COMPLETED);
      return;
    }

    feedback.playClick();
    const nextQuestion = filteredQuestions[currentIndex + 1];
    setSelectedQuestion(nextQuestion);
    setSelectedIds(prev => prev.includes(nextQuestion.id) ? prev : [...prev, nextQuestion.id]);
  }, [selectedQuestion, selectedSeries, filteredQuestions, selectedIds]);

  const toggleFavorite = useCallback((question: Question) => {
    feedback.haptic(20);
    setFavorites(prev => {
      const exists = prev.find(f => f.id === question.id);
      if (exists) return prev.filter(f => f.id !== question.id);
      return [...prev, question];
    });
  }, []);

  const handleBackToMenu = useCallback(() => {
    feedback.playClick();
    if (selectedSeries?.id === 'ai') setCurrentView(GameView.SERIES_SELECTION);
    else setCurrentView(GameView.MENU);
    setTimeout(() => setSelectedQuestion(null), 300);
  }, [selectedSeries]);

  const handleResetToSeries = useCallback(() => {
    feedback.playClick();
    setCurrentView(GameView.SERIES_SELECTION);
    setSelectedSeries(null);
  }, []);

  const handleRestartSeries = useCallback(() => {
    feedback.playTransition();
    if (!selectedSeries) return;
    const seriesIds = filteredQuestions.map(q => q.id);
    setSelectedIds(prev => prev.filter(id => !seriesIds.includes(id)));
    setCurrentView(GameView.MENU);
    setSelectedQuestion(null);
  }, [selectedSeries, filteredQuestions]);

  const toggleOrientation = useCallback(() => {
    feedback.haptic(10);
    setOrientation(prev => prev === Orientation.PORTRAIT ? Orientation.LANDSCAPE : Orientation.PORTRAIT);
  }, []);

  const currentQuestionIndex = useMemo(() => {
    if (!selectedQuestion || !filteredQuestions.length) return undefined;
    const idx = filteredQuestions.findIndex(q => q.id === selectedQuestion.id);
    return idx !== -1 ? idx + 1 : undefined;
  }, [selectedQuestion, filteredQuestions]);

  const accentColor = selectedSeries?.color || "#d4af37";

  /**
   * دالة العودة التدريجية
   */
  const handleStepBack = () => {
    feedback.playClick();

    if (mainMode === MainMode.ONLINE) {
      switch (onlineView) {
        case OnlineView.ROOM:
          setOnlineView(isHost ? OnlineView.SELECT_SERIES : OnlineView.JOIN);
          setOnlineSelectedSeries(null);
          break;
        case OnlineView.SELECT_SERIES:
          setOnlineView(OnlineView.LOBBY);
          break;
        case OnlineView.WAITING_FOR_HOST:
          setOnlineView(OnlineView.JOIN);
          break;
        case OnlineView.LOBBY:
        case OnlineView.JOIN:
          setOnlineView(OnlineView.ENTRY);
          setOnlineRoomId('');
          break;
        case OnlineView.ENTRY:
          setMainMode(MainMode.SELECTION);
          break;
        default:
          setMainMode(MainMode.SELECTION);
          break;
      }
      return;
    }

    if (mainMode === MainMode.SOLO) {
       switch (soloView) {
         case SoloView.ROOM:
           setSoloView(SoloView.SELECT_SERIES);
           setSoloSelectedSeries(null);
           break;
         case SoloView.SELECT_SERIES:
           setSoloView(SoloView.ENTRY);
           break;
         case SoloView.ENTRY:
           setMainMode(MainMode.SELECTION);
           break;
         default:
           setMainMode(MainMode.SELECTION);
           break;
       }
       return;
    }

    if (mainMode === MainMode.ONE_DEVICE) {
      switch (currentView) {
        case GameView.QUESTION:
          if (selectedSeries?.id === 'ai') {
            setCurrentView(GameView.SERIES_SELECTION);
            setSelectedSeries(null);
          } else {
            setCurrentView(GameView.MENU);
          }
          setSelectedQuestion(null);
          break;
        case GameView.MENU:
        case GameView.RULES:
        case GameView.FAVORITES:
        case GameView.SERIES_COMPLETED:
          setCurrentView(GameView.SERIES_SELECTION);
          setSelectedSeries(null);
          break;
        case GameView.SERIES_SELECTION:
          setMainMode(MainMode.SELECTION);
          break;
        default:
          setMainMode(MainMode.SELECTION);
          break;
      }
    }
  };

  return (
    <div className={`min-h-screen bg-[#050505] transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${orientation === Orientation.LANDSCAPE ? 'landscape-mode' : ''}`}>
      
      {mainMode !== MainMode.SELECTION && (
        <div className="fixed top-8 left-8 z-50 flex gap-3">
          {mainMode === MainMode.ONE_DEVICE && (
            <button onClick={() => { feedback.playClick(); setCurrentView(GameView.FAVORITES); }} className="glass-card p-4 rounded-2xl border border-[#ff4d6d]/20 text-[#ff4d6d] hover:text-[#ff4d6d]/80 transition-all active:scale-90" title="المفضلة">
              <Heart size={22} fill={favorites.length > 0 ? "currentColor" : "none"} />
            </button>
          )}
          <button onClick={toggleOrientation} className="glass-card p-4 rounded-2xl border border-[#d4af37]/20 text-[#d4af37]/60 hover:text-[#d4af37] transition-all active:scale-90" title="تغيير العرض">
            {orientation === Orientation.PORTRAIT ? <MonitorPlay size={22} /> : <Smartphone size={22} />}
          </button>
          
          <button onClick={handleStepBack} className="glass-card p-4 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all active:scale-90" title="العودة للخلف">
            <ArrowRight size={22} />
          </button>
        </div>
      )}

      <main className={`w-full h-full transition-all duration-500 ${orientation === Orientation.LANDSCAPE ? 'max-w-none px-12' : 'max-w-4xl mx-auto'}`}>
        
        {mainMode === MainMode.SELECTION && (
          <ModeSelector onSelectMode={(mode) => {
            setMainMode(mode as MainMode);
            if (mode === 'ONLINE') setOnlineView(OnlineView.ENTRY);
            if (mode === 'SOLO') setSoloView(SoloView.ENTRY);
          }} />
        )}

        {mainMode === MainMode.ONLINE && (
          <OnlineGame 
            onBack={handleStepBack} 
            orientation={orientation} 
            view={onlineView}
            setView={setOnlineView}
            roomId={onlineRoomId}
            setRoomId={setOnlineRoomId}
            isHost={isHost}
            setIsHost={setIsHost}
            selectedSeries={onlineSelectedSeries}
            setSelectedSeries={setOnlineSelectedSeries}
          />
        )}

        {mainMode === MainMode.SOLO && (
          <SoloGame 
            onBack={handleStepBack} 
            orientation={orientation}
            view={soloView}
            setView={setSoloView}
            selectedSeries={soloSelectedSeries}
            setSelectedSeries={setSoloSelectedSeries}
          />
        )}

        {mainMode === MainMode.ONE_DEVICE && (
          <>
            {currentView === GameView.SERIES_SELECTION && <SeriesSelector onSelect={handleSelectSeries} orientation={orientation} />}
            
            {currentView === GameView.AI_GENERATING && (
              <div className="flex flex-col items-center justify-center min-h-screen">
                 <div className="relative">
                    <div className="absolute inset-0 bg-[#d4af37]/10 blur-3xl animate-pulse"></div>
                    <Loader2 size={80} className="text-[#d4af37] animate-spin relative z-10" />
                 </div>
                 <h2 className="mt-8 text-2xl font-black text-gradient-gold animate-pulse text-center px-6">نستحضر لك سؤالاً من أعماق الروح...</h2>
              </div>
            )}

            {currentView === GameView.RULES && selectedSeries && <RulesScreen onStart={handleStartGame} seriesName={selectedSeries.name} orientation={orientation} />}
            
            {currentView === GameView.MENU && selectedSeries && (
              <NumberGrid 
                onSelect={handleSelectQuestion} 
                selectedIds={selectedIds}
                questions={filteredQuestions}
                seriesName={selectedSeries.name}
                onBack={handleResetToSeries}
                orientation={orientation}
              />
            )}

            {currentView === GameView.QUESTION && selectedQuestion && (
              <QuestionCard 
                question={selectedQuestion} 
                onBack={handleBackToMenu} 
                onNext={handleNext}
                orientation={orientation}
                isFavorite={!!favorites.find(f => f.id === selectedQuestion.id)}
                onToggleFavorite={() => toggleFavorite(selectedQuestion)}
                currentIndex={currentQuestionIndex}
                totalCount={filteredQuestions.length}
                isLastQuestion={currentQuestionIndex === filteredQuestions.length}
              />
            )}

            {currentView === GameView.SERIES_COMPLETED && selectedSeries && (
              <SeriesCompletedScreen 
                seriesName={selectedSeries.name}
                onRestart={handleRestartSeries}
                onNewSeries={handleResetToSeries}
                orientation={orientation}
              />
            )}

            {currentView === GameView.FAVORITES && (
               <div className="flex flex-col items-center min-h-screen p-8 pt-24 pb-20">
                  <h2 className="text-4xl font-black text-gradient-gold mb-12">الأسئلة المفضلة</h2>
                  {favorites.length === 0 ? <p className="text-white/20 italic">لم تقم بإضافة أي أسئلة للمفضلة بعد...</p> : (
                    <div className="grid gap-6 w-full max-w-2xl">
                       {favorites.map(fav => (
                         <button key={fav.id} onClick={() => { feedback.playClick(); setSelectedQuestion(fav); setCurrentView(GameView.QUESTION); }} className="glass-card p-6 rounded-3xl border border-white/5 hover:border-[#ff4d6d]/30 text-right transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-[#ff4d6d]/40 group-hover:w-2 transition-all"></div>
                            <p className="text-white/80 font-bold group-hover:text-white mb-2 leading-relaxed">{fav.text}</p>
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                                {typeof fav.seriesId === 'number' ? `سلسلة ${fav.seriesId}` : 'AI QUESTION'}
                            </span>
                         </button>
                       ))}
                    </div>
                  )}
                  <button onClick={() => { feedback.playClick(); setCurrentView(GameView.SERIES_SELECTION); }} className="mt-12 text-[#d4af37] font-bold underline opacity-60 hover:opacity-100 transition-all">العودة للسلاسل</button>
               </div>
            )}
          </>
        )}
      </main>
      
      {/* Background Decor */}
      <div 
        className="fixed -bottom-48 -left-48 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-40 transition-all duration-1000"
        style={{ backgroundColor: accentColor + '20' }}
      ></div>
      <div 
        className="fixed -top-48 -right-48 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-40 transition-all duration-1000"
        style={{ backgroundColor: '#d4af3720' }}
      ></div>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePadminiStore } from './store';
import LessonPath from './components/LessonPath';
import QuizScreen from './components/QuizScreen';
import SuccessScreen from './components/SuccessScreen';
import AdminDashboard from './components/AdminDashboard';
import ParentMode from './components/ParentMode';
import LoginScreen from './components/LoginScreen'; // අලුත් Login Screen එක
import Leaderboard from './components/Leaderboard';
import GemShop from './components/GemShop';
import ApiService from './services/api';
import VoiceService from './services/voice';
import { Sparkles, Loader2, Settings, User, Trophy, ListChecks, ShoppingBag, ChevronRight, Layout } from 'lucide-react';

const App = () => {
  const store = usePadminiStore();

  const {
    userName, currentScreen, setScreen, userId, xp, gems, level, streak,
    addStudyTime, missedQuestions, dailyQuests, completedLessonIds
  } = store;

  const [activeLesson, setActiveLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [lastResult, setLastResult] = useState({ score: 0, total: 0 });
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState('0:00');
  const [allUnits, setAllUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuests, setShowQuests] = useState(false);

  // 1. Fetch Syllabus Units
  useEffect(() => {
    const unsubscribe = ApiService.getUnits((units) => {
      setAllUnits(units);
      setIsLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  // 2. Cloud Sync Progress
  useEffect(() => {
    if (userId && userName) {
      ApiService.saveUserProgress(userId, { userName, xp, level, streak, gems, completedLessonIds });
    }
  }, [xp, level, streak, gems, userId, userName, completedLessonIds]);

  const startLessonSequence = (lessonId) => {
    // ඒකක අතරින් අදාළ පාඩම සොයා ගැනීම
    const allThemes = allUnits.flatMap(u => u.themes);
    const theme = allThemes.find(t => String(t.id) === String(lessonId));
    if (!theme) return;
    setActiveLesson(theme);
    setScreen('guide');
  };

  const startQuiz = () => {
    if (!activeLesson) return;
    setQuizQuestions([...activeLesson.questions].sort(() => Math.random() - 0.5));
    setStartTime(Date.now());
    setScreen('quiz');
    VoiceService.speak("අභ්‍යාස පටන් ගමු");
  };

  const handleQuizFinish = (score, total) => {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    addStudyTime(durationSeconds);

    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    setTimeSpent(`${mins}:${secs < 10 ? '0' : ''}${secs}`);

    setLastResult({ score, total });
    store.completeLesson(score, total, activeLesson?.id, durationSeconds);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#FFFEF7] flex items-center justify-center">
        <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#58CC02] animate-spin mx-auto" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">පද්මිනී පන්තිය සූදානම් කරමින්...</p>
        </div>
      </div>
    );
  }

  // දරුවා ලොග් වී නැතිනම් මුලින්ම Login Screen එක පෙන්වයි
  if (!userName) {
    return <LoginScreen onDone={() => setScreen('path')} />;
  }

  const allLessonsFlat = allUnits.flatMap(u => u.themes);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFFEF7] font-sinhala relative overflow-hidden text-slate-800">
      <AnimatePresence mode="wait">
        {currentScreen === 'path' && (
          <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LessonPath onStartLesson={startLessonSequence} lessons={allLessonsFlat} />

            {/* Sidebar Buttons */}
            <div className="fixed bottom-24 left-6 flex flex-col gap-3 z-40">
                <button onClick={() => setScreen('shop')} className="w-12 h-12 bg-white border-b-4 border-slate-200 rounded-2xl flex items-center justify-center text-brand-sky shadow-lg hover:scale-110 transition-all"><ShoppingBag size={24} /></button>
                <button onClick={() => setShowQuests(true)} className="w-12 h-12 bg-white border-b-4 border-slate-200 rounded-2xl flex items-center justify-center text-brand-sky shadow-lg hover:scale-110 transition-all"><ListChecks size={24} /></button>
                <button onClick={() => setScreen('leaderboard')} className="w-12 h-12 bg-white border-b-4 border-slate-200 rounded-2xl flex items-center justify-center text-yellow-500 shadow-lg hover:scale-110 transition-all"><Trophy size={24} /></button>
            </div>

            <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
                <button onClick={() => setScreen('parent')} className="w-12 h-12 bg-white border-b-4 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-lg hover:scale-110 transition-all"><Layout size={24} /></button>
                <button onClick={() => setScreen('admin')} className="w-12 h-12 bg-white border-b-4 border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 shadow-lg hover:scale-110 transition-all"><Settings size={24} /></button>
            </div>

            {/* Daily Quests Overlay */}
            <AnimatePresence>
                {showQuests && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQuests(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-end justify-center p-4">
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-sm rounded-t-[3rem] p-8 pb-12 shadow-2xl">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><ListChecks className="text-brand-sky" /> අද මෙහෙයුම්</h2>
                            <div className="space-y-4">
                                {dailyQuests.map(q => (
                                    <div key={q.id} className="bg-slate-50 p-5 rounded-3xl border-2 border-slate-100">
                                        <span className="font-bold text-slate-700">{q.text}</span>
                                        <div className="h-3 bg-white rounded-full mt-3 overflow-hidden border border-slate-100">
                                            <motion.div animate={{ width: `${(q.current / q.goal) * 100}%` }} className={`h-full ${q.completed ? 'bg-brand-green' : 'bg-brand-sky'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowQuests(false)} className="btn-primary w-full mt-8 py-4 text-white">වහන්න</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        )}

        {currentScreen === 'shop' && <GemShop onBack={() => setScreen('path')} />}
        {currentScreen === 'leaderboard' && <Leaderboard onBack={() => setScreen('path')} />}
        {currentScreen === 'guide' && <QuizScreen key="guide" questions={[]} themeTitle={activeLesson?.title} isGuide={true} onClose={() => setScreen('path')} onStart={startQuiz} guidebook={activeLesson?.guidebook} />}
        {currentScreen === 'quiz' && <QuizScreen key="quiz" questions={quizQuestions} themeTitle={activeLesson?.title} onClose={() => setScreen('path')} onFinish={handleQuizFinish} />}
        {currentScreen === 'completion' && <SuccessScreen key="success" score={lastResult.score} total={lastResult.total} timeSpent={timeSpent} onContinue={() => setScreen('path')} />}
        {currentScreen === 'admin' && <AdminDashboard onBack={() => setScreen('path')} />}
        {currentScreen === 'parent' && <ParentMode onBack={() => setScreen('path')} />}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-primary { background-color: #58CC02; border-bottom: 8px solid #46A302; color: white; border-radius: 1.5rem; transition: all 0.1s; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-primary:active { border-bottom-width: 0px; transform: translateY(4px); }
        .btn-primary:disabled { background-color: #E5E7EB; border-bottom-color: #D1D5DB; color: #9CA3AF; cursor: not-allowed; }
      `}} />
    </div>
  );
};

export default App;

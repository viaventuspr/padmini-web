import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePadminiStore } from './store';
import LessonPath from './components/LessonPath';
import QuizScreen from './components/QuizScreen';
import SuccessScreen from './components/SuccessScreen';
import ApiService from './services/api';
import VoiceService from './services/voice';
import { VoiceManager } from './services/VoiceManager';
import { Loader2, ShoppingBag, Layout, WifiOff, ShieldCheck, Trophy, Gem } from 'lucide-react';

const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ParentMode = lazy(() => import('./components/ParentMode'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const GemShop = lazy(() => import('./components/GemShop'));

// ── Role Guard ──
const RoleGuard = ({ children, fallback = 'path' }) => {
  const { isAdmin, setScreen, isAuthLoading } = usePadminiStore();
  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      setScreen(fallback);
      window.history.replaceState(null, '', '/');
    }
  }, [isAdmin, setScreen, fallback, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-lotus-500 animate-spin" />
      </div>
    );
  }
  return isAdmin ? children : null;
};

const App = () => {
  const store = usePadminiStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    userName, currentScreen, setScreen, userId, xp, gems, level, streak,
    addStudyTime, completedLessonIds, isAdmin, fcmToken
  } = store;

  const [activeLesson, setActiveLesson] = useState(null);
  const [lastResult, setLastResult] = useState({ score: 0, total: 0 });
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState('0:00');
  const [allUnits, setAllUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path === '/admin') setScreen('admin');
      else if (path === '/shop') setScreen('shop');
      else if (path === '/leaderboard') setScreen('leaderboard');
      else if (path === '/parent') setScreen('parent');
    };
    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    VoiceManager.loadCustomVoices();
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [setScreen]);

  useEffect(() => {
    let newPath = '/';
    if (currentScreen === 'admin') newPath = '/admin';
    else if (currentScreen === 'shop') newPath = '/shop';
    else if (currentScreen === 'leaderboard') newPath = '/leaderboard';
    else if (currentScreen === 'parent') newPath = '/parent';
    if (window.location.pathname !== newPath) window.history.pushState(null, '', newPath);
  }, [currentScreen]);

  useEffect(() => {
    const unsubscribe = ApiService.getUnits((units) => { setAllUnits(units); setIsLoading(false); });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  useEffect(() => {
    if (userId && userName) {
      const syncData = { userName, xp, level, streak, gems, completedLessonIds, isAdmin, fcmToken: fcmToken || null };
      ApiService.saveUserProgress(userId, syncData);

      if (!fcmToken && 'Notification' in window && Notification.permission !== 'denied') {
        import('./firebase').then(({ messaging }) => {
          if (messaging) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                import('firebase/messaging').then(({ getToken }) => {
                  getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
                    .then(token => usePadminiStore.setState({ fcmToken: token }))
                    .catch(() => {});
                });
              }
            });
          }
        });
      }
    }
  }, [xp, level, streak, gems, userId, userName, completedLessonIds, isAdmin, fcmToken]);

  const startLessonSequence = (lessonId) => {
    const allThemes = allUnits.flatMap(u => u.themes);
    const theme = allThemes.find(t => String(t.id) === String(lessonId));
    if (!theme) return;
    
    // 🎲 Deep Logic: සසම්භාවී ප්‍රශ්න තෝරාගැනීම (Random Subset Selection)
    // දරුවාට හැම වෙලේම අලුත් අත්දැකීමක් දීමට මුළු ප්‍රශ්න බැංකුවෙන් 5ක් පමණක් තෝරා ගනී.
    const allQuestions = [...(theme.questions || [])];
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5); // සාමාන්‍යයෙන් ප්‍රශ්න 5ක් ප්‍රමාණවත්
    
    setActiveLesson({ ...theme, questions: selectedQuestions });
    setScreen('guide');
  };

  const handleQuizFinish = (score, total) => {
    const durationSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    if (addStudyTime) addStudyTime(durationSeconds);
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    setTimeSpent(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    setLastResult({ score, total });
    store.completeLesson(score, total, activeLesson?.id, durationSeconds);
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto min-h-screen bg-app flex flex-col items-center justify-center gap-4 px-8">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-lotus-500 animate-spin" />
          <div className="absolute inset-0 bg-lotus-400/20 blur-xl rounded-full"></div>
        </div>
        <p className="text-xs font-bold text-lotus-300 uppercase tracking-widest">පද්මිනී පන්තිය සම්බන්ධ කරමින්...</p>
        <button onClick={() => setIsLoading(false)} className="mt-4 text-[10px] text-lotus-400 underline font-bold">ප්‍රමාද වැඩියිද? ඇතුළට යමු</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-app font-sinhala relative overflow-hidden text-lotus-950">

      {/* Offline Alert */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}
            className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-red-500 to-rose-500 text-white p-2 text-center text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <WifiOff size={12} /> Offline - ප්‍රගතිය සුරැකීම තාවකාලිකව නතර වී ඇත
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 text-lotus-300 animate-spin" /></div>}>
        <AnimatePresence mode="wait">
          {!userName ? (
            <LoginScreen key="login" onDone={() => {
              const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
              setScreen(path === '/admin' ? 'admin' : 'path');
            }} />
          ) : (
            <>
              {currentScreen === 'path' && (
                <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LessonPath onStartLesson={startLessonSequence} lessons={allUnits.flatMap(u => u.themes)} allUnits={allUnits} />

                  {/* ── Floating Navigation ── */}
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-float border border-lotus-100/50">
                      <button onClick={() => setScreen('shop')} className="w-11 h-11 rounded-full bg-lotus-50 flex items-center justify-center text-lotus-500 hover:bg-lotus-100 transition-all">
                        <Gem size={20} />
                      </button>
                      <button onClick={() => setScreen('leaderboard')} className="w-11 h-11 rounded-full bg-gold-50 flex items-center justify-center text-gold-500 hover:bg-gold-100 transition-all">
                        <Trophy size={20} />
                      </button>
                      <button onClick={() => setScreen('parent')} className="w-11 h-11 rounded-full bg-ocean-50 flex items-center justify-center text-ocean-500 hover:bg-ocean-100 transition-all">
                        <Layout size={20} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => setScreen('admin')} className="h-11 px-4 rounded-full bg-lotus-900 flex items-center gap-2 text-lotus-300 hover:bg-lotus-800 transition-all shadow-glow-purple">
                          <ShieldCheck size={18} />
                          <span className="text-[10px] font-black uppercase tracking-wider">ගුරු පාලකය</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentScreen === 'shop' && <GemShop onBack={() => setScreen('path')} />}
              {currentScreen === 'leaderboard' && <Leaderboard onBack={() => setScreen('path')} />}
              {currentScreen === 'guide' && <QuizScreen key="guide" questions={[]} themeTitle={activeLesson?.title} isGuide={true} onClose={() => setScreen('path')} onStart={() => { setStartTime(Date.now()); setScreen('quiz'); }} guidebook={activeLesson?.guidebook} />}
              {currentScreen === 'quiz' && <QuizScreen key="quiz" questions={activeLesson?.questions || []} themeTitle={activeLesson?.title} onClose={() => setScreen('path')} onFinish={handleQuizFinish} />}
              {currentScreen === 'completion' && <SuccessScreen key="success" score={lastResult.score} total={lastResult.total} timeSpent={timeSpent} onContinue={() => setScreen('path')} />}

              {currentScreen === 'admin' && (
                <RoleGuard><AdminDashboard onBack={() => setScreen('path')} /></RoleGuard>
              )}
              {currentScreen === 'parent' && <ParentMode onBack={() => setScreen('path')} />}
            </>
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default App;

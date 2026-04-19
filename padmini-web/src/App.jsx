import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePadminiStore } from './store';
import LessonPath from './components/LessonPath';
import QuizScreen from './components/QuizScreen';
import SuccessScreen from './components/SuccessScreen';
import ApiService from './services/api';
import VoiceService from './services/voice';
import { VoiceManager } from './services/VoiceManager';
import { Loader2, Settings, Trophy, ListChecks, ShoppingBag, Layout, WifiOff, AlertCircle, ShieldCheck } from 'lucide-react';

// Lazy loading for Dashboard parts (Better Performance)
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ParentMode = lazy(() => import('./components/ParentMode'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const GemShop = lazy(() => import('./components/GemShop'));

// --- Professional Role Guard (Middleware Equivalent) ---
const RoleGuard = ({ children, fallback = 'path' }) => {
  const { isAdmin, setScreen, isAuthLoading } = usePadminiStore();

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      console.error("⛔ අනවසර ඇතුළුවීමක්! Node.js Middleware මගින් ඔබව වළක්වා ඇත.");
      setScreen(fallback);
      window.history.replaceState(null, '', '/');
    }
  }, [isAdmin, setScreen, fallback, isAuthLoading]);

  // Loading spinner during backend Role Auth verification
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-[#58CC02] animate-spin" />
      </div>
    );
  }

  return isAdmin ? children : null;
};

const avatarEmojis = { 
  owl: '🦉', 
  lion: '🦁', 
  butterfly: '🦋', 
  elephant: '🐘',
  fairy: <img src="/images/padmini_fairy.png" className="w-full h-full object-contain" alt="Padmini" />
};

const App = () => {
  const store = usePadminiStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    userName, currentScreen, setScreen, userId, xp, gems, level, streak,
    addStudyTime, completedLessonIds, isAdmin, fcmToken
  } = store;

  const [activeLesson, setActiveLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [lastResult, setLastResult] = useState({ score: 0, total: 0 });
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState('0:00');
  const [allUnits, setAllUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // --- Smart URL Router (Middleware Integration) ---
  useEffect(() => {
    const handleUrlRoute = () => {
      // url එකේ අගට /admin, /shop වගේ දේවල් දමනවා නම් අදාළ තැනට Redirect වේ
      const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
      if (path === '/admin') setScreen('admin');
      else if (path === '/shop') setScreen('shop');
      else if (path === '/leaderboard') setScreen('leaderboard');
    };
    
    handleUrlRoute(); // Initial check
    window.addEventListener('popstate', handleUrlRoute);

    // ලෝඩ් වන විට ගුරුවරියගේ කටහඬවල් Download කර ඇප් එකේ AI Voice වෙනුවට ආදේශ කිරීම
    VoiceManager.loadCustomVoices();

    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [setScreen]);

  // Update URL to match current screen for shareability without extra libraries
  useEffect(() => {
    let newPath = '/';
    if (currentScreen === 'admin') newPath = '/admin';
    else if (currentScreen === 'shop') newPath = '/shop';
    else if (currentScreen === 'leaderboard') newPath = '/leaderboard';
    
    if (window.location.pathname !== newPath) {
       window.history.pushState(null, '', newPath);
    }
  }, [currentScreen]);

  useEffect(() => {
    const unsubscribe = ApiService.getUnits((units) => {
      setAllUnits(units);
      setIsLoading(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId && userName) {
      // fcmToken undefined නම් Firebase crash වේ, ඒ නිසා null හෝ delete දමයි.
      const syncData = { userName, xp, level, streak, gems, completedLessonIds, isAdmin, fcmToken: fcmToken || null };
      ApiService.saveUserProgress(userId, syncData);
      
      // පැරණි පරිශීලකයින් සඳහා ස්වයංක්‍රීයව Push Notification අවසරය විමසීම
      if (!fcmToken && 'Notification' in window && Notification.permission !== 'denied') {
         import('./firebase').then(({ messaging }) => {
            if (messaging) {
               Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                     import('firebase/messaging').then(({ getToken }) => {
                        getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
                          .then(token => usePadminiStore.setState({ fcmToken: token }))
                          .catch(e => console.warn("Push token fetch failed:", e));
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
    setActiveLesson(theme);
    setScreen('guide');
  };

  const handleQuizFinish = (score, total) => {
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    if (addStudyTime) addStudyTime(durationSeconds);
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    setTimeSpent(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    setLastResult({ score, total });
    store.completeLesson(score, total, activeLesson?.id, durationSeconds);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#FFFEF7] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#58CC02] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFFEF7] font-sinhala relative overflow-hidden text-slate-800 shadow-2xl">

      {/* Network Alert */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }} className="fixed top-0 left-0 right-0 z-[1000] bg-rose-500 text-white p-2 text-center text-[10px] font-black uppercase">
            ⚠️ Offline - ප්‍රගතිය සුරැකීම තාවකාලිකව නතර වී ඇත
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 text-brand-sky animate-spin opacity-20" /></div>}>
        <AnimatePresence mode="wait">
          {!userName ? (
            <LoginScreen key="login" onDone={() => {
                const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
                setScreen(path === '/admin' ? 'admin' : 'path');
            }} />
          ) : (
            <>
              {currentScreen === 'path' && (
                <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LessonPath onStartLesson={startLessonSequence} lessons={allUnits.flatMap(u => u.themes)} />

                  {/* Sidebar Control Center */}
                  <div className="fixed bottom-24 left-6 flex flex-col gap-3 z-40">
                      <button onClick={() => setScreen('shop')} className="w-12 h-12 bg-white border-b-4 border-slate-200 rounded-2xl flex items-center justify-center text-brand-sky shadow-lg hover:scale-110 transition-all"><ShoppingBag size={24} /></button>
                      <button onClick={() => setScreen('leaderboard')} className="w-12 h-12 bg-white border-b-4 border-slate-200 rounded-2xl flex items-center justify-center text-yellow-500 shadow-lg hover:scale-110 transition-all"><Trophy size={24} /></button>
                  </div>

                  <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
                      <button onClick={() => setScreen('parent')} className="w-12 h-12 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-lg hover:scale-110 transition-all"><Layout size={24} /></button>

                      {/* Admin Only Button - Shield Icon indicating protected area */}
                      {isAdmin && (
                        <button onClick={() => setScreen('admin')} className="w-12 h-12 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center text-brand-green shadow-lg hover:scale-110 transition-all">
                            <ShieldCheck size={24} />
                        </button>
                      )}
                  </div>
                </motion.div>
              )}

              {currentScreen === 'shop' && <GemShop onBack={() => setScreen('path')} />}
              {currentScreen === 'leaderboard' && <Leaderboard onBack={() => setScreen('path')} />}
              {currentScreen === 'guide' && <QuizScreen key="guide" questions={[]} themeTitle={activeLesson?.title} isGuide={true} onClose={() => setScreen('path')} onStart={() => setScreen('quiz')} guidebook={activeLesson?.guidebook} />}
              {currentScreen === 'quiz' && <QuizScreen key="quiz" questions={activeLesson?.questions} themeTitle={activeLesson?.title} onClose={() => setScreen('path')} onFinish={handleQuizFinish} />}
              {currentScreen === 'completion' && <SuccessScreen key="success" score={lastResult.score} total={lastResult.total} timeSpent={timeSpent} onContinue={() => setScreen('path')} />}

              {/* --- Admin Protected Route (Like Next.js Dashboard Layout) --- */}
              {currentScreen === 'admin' && (
                <RoleGuard>
                  <AdminDashboard onBack={() => setScreen('path')} />
                </RoleGuard>
              )}

              {currentScreen === 'parent' && <ParentMode onBack={() => setScreen('path')} />}
            </>
          )}
        </AnimatePresence>
      </Suspense>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-primary { background-color: #58CC02; border-bottom: 8px solid #46A302; color: white; border-radius: 1.5rem; transition: all 0.1s; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-primary:active { border-bottom-width: 0px; transform: translateY(4px); }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}} />
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Flame, Gem, Zap, CheckCircle2, Heart, Gift, Star, Trophy, Award, Medal } from 'lucide-react';
import { usePadminiStore } from '../store';

const UnitHeader = ({ title, description, colorClass }) => (
  <div className={`w-full p-6 mb-10 rounded-[2.5rem] text-white shadow-xl ${colorClass} relative overflow-hidden border-b-8 border-black/10`}>
    <div className="relative z-10">
      <h2 className="text-2xl font-black font-sinhala leading-tight">{title}</h2>
      <p className="text-[10px] font-bold opacity-90 font-sinhala mt-1 uppercase tracking-widest">{description}</p>
    </div>
    <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-10 rotate-12">📚</div>
  </div>
);

const LessonNode = ({ id, icon, title, isLocked, progress, marginClass, onClick, isSpecial = false }) => (
  <div className={`flex flex-col items-center mb-20 relative z-10 ${marginClass}`}>
    <div className="relative group">
      <svg className="absolute -inset-3 w-28 h-28 rotate-[-90deg]">
        <circle cx="56" cy="56" r="48" fill="transparent" stroke="#E5E7EB" strokeWidth="10" />
        {!isLocked && (
          <motion.circle
            cx="56" cy="56" r="48"
            fill="transparent"
            stroke={isSpecial ? "#FF4B4B" : "#FFD700"}
            strokeWidth="10"
            strokeDasharray={301.59}
            initial={{ strokeDashoffset: 301.59 }}
            animate={{ strokeDashoffset: 301.59 - (301.59 * progress) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        )}
      </svg>

      <button
        onClick={() => !isLocked && onClick(id)}
        disabled={isLocked}
        className={`relative w-22 h-22 rounded-full flex items-center justify-center text-4xl transition-all active:translate-y-2 shadow-xl
          ${isLocked ? 'bg-slate-200 border-b-8 border-slate-300 cursor-not-allowed' :
            isSpecial ? 'bg-orange-500 border-b-8 border-orange-700 text-white animate-pulse' :
            'bg-[#58CC02] border-b-8 border-[#46A302] hover:brightness-110 active:border-b-0'}`}
        style={{ width: '88px', height: '88px' }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
        {isLocked ? <Lock className="text-slate-400" size={32} /> : icon}
        {progress === 100 && !isSpecial && (
            <div className="absolute -right-1 -top-1 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-sm">
                <CheckCircle2 size={16} className="text-white" />
            </div>
        )}
      </button>
    </div>
    <div className={`mt-6 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm border-2 font-sinhala
      ${isLocked ? 'bg-slate-100 text-slate-300 border-slate-200' :
        isSpecial ? 'bg-orange-100 text-orange-600 border-orange-200' :
        'bg-white text-slate-600 border-slate-100'}`}>
      {title}
    </div>
  </div>
);

const LessonPath = ({ onStartLesson, lessons = [] }) => {
  // Safe destructuring with default values to prevent "undefined" errors
  const store = usePadminiStore();
  const {
    completedLessonIds = [], xp = 0, streak = 0, userName = "ළමයා",
    hearts = 5, avatarId = "owl", dailyQuests = [], achievements = [],
    newAchievementNotif = null, clearAchievementNotif = () => {}
  } = store;

  const [buddyMessage, setBuddyMessage] = useState("");
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    // Robust check for dailyQuests
    const incompleteQuest = Array.isArray(dailyQuests) ? dailyQuests.find(q => !q?.completed) : null;
    setBuddyMessage(incompleteQuest ? `දරුවෝ, ${incompleteQuest.text} සම්පූර්ණ කරමුද?` : `${userName}, ඔයා අද නියම දක්ෂයෙක්! 🌟`);
  }, [dailyQuests, userName]);

  const units = [
    { title: "ඒකකය 1", desc: "ස්වභාවධර්මයේ අසිරිය", color: "bg-gradient-to-br from-green-400 to-green-600" },
    { title: "ඒකකය 2", desc: "නිරෝගී දිවිය", color: "bg-gradient-to-br from-blue-400 to-blue-600" },
    { title: "ඒකකය 3", desc: "අහස සහ පොළොව", color: "bg-gradient-to-br from-purple-400 to-purple-600" },
    { title: "ඒකකය 4", desc: "අපේ උරුමය", color: "bg-gradient-to-br from-rose-400 to-rose-600" },
  ];

  const avatarEmojis = { owl: '🦉', lion: '🦁', butterfly: '🦋', elephant: '🐘' };
  const margins = ["ml-0", "ml-24", "ml-40", "ml-20", "ml-0", "-ml-20", "-ml-40", "-ml-24"];

  return (
    <div className="min-h-screen bg-[#FFFEF7] pb-32 font-sinhala overflow-x-hidden relative">

      {/* Achievement Notification Overlay */}
      <AnimatePresence>
        {newAchievementNotif && (
          <motion.div
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-6 right-6 z-[120] bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-yellow-400"
          >
            <div className="text-4xl">{newAchievementNotif.icon || '🏅'}</div>
            <div>
                <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">අලුත් දක්ෂතාවයක්!</p>
                <h4 className="font-black text-lg">{newAchievementNotif.title || 'ජයග්‍රහණයක්'}</h4>
            </div>
            <button onClick={clearAchievementNotif} className="ml-auto p-2 text-slate-400"><Lock size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-slate-100 p-4 shadow-sm">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-2xl border-2 border-orange-100">
                <Flame size={20} className="text-orange-500 fill-orange-500" />
                <span className="font-black text-orange-600">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-2xl border-2 border-rose-100">
                <Heart size={20} className="text-rose-500 fill-rose-500" />
                <span className="font-black text-rose-600">{hearts}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowAchievements(true)} className="bg-yellow-50 p-2 rounded-xl border border-yellow-200 text-yellow-600">
                <Medal size={24} />
            </button>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-slate-100 text-3xl">
                {avatarEmojis[avatarId] || '🦉'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center max-w-md mx-auto px-6 pt-10">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full mb-12 flex items-end gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-50">
            <div className="text-5xl">{avatarEmojis[avatarId] || '🦉'}</div>
            <div className="flex-1 bg-blue-50 p-4 rounded-3xl rounded-bl-none relative">
                <p className="text-sm font-bold text-blue-700 italic">"{buddyMessage}"</p>
                <div className="absolute -left-2 bottom-0 w-4 h-4 bg-blue-50 rotate-45"></div>
            </div>
        </motion.div>

        {units.map((unit, uIdx) => {
          const unitLessons = Array.isArray(lessons) ? lessons.slice(uIdx * 4, (uIdx + 1) * 4) : [];
          const isUnitCompleted = unitLessons.length > 0 && unitLessons.every(l => completedLessonIds.includes(l.id));

          return (
            <div key={uIdx} className="w-full">
              <UnitHeader title={unit.title} description={unit.desc} colorClass={unit.color} />
              <div className="flex flex-col items-center">
                {unitLessons.map((theme, lIdx) => {
                  const globalIdx = uIdx * 4 + lIdx;
                  const isLocked = !completedLessonIds.includes(theme.id) && globalIdx !== 0 && !completedLessonIds.includes(lessons[globalIdx-1]?.id);
                  const isCompleted = completedLessonIds.includes(theme.id);
                  return (
                    <LessonNode
                      key={theme.id} id={theme.id} icon={theme.icon} title={theme.title}
                      isLocked={isLocked} progress={isCompleted ? 100 : 0}
                      marginClass={margins[globalIdx % margins.length]} onClick={onStartLesson}
                    />
                  );
                })}
                <div className="mb-24 flex flex-col items-center gap-3">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-slate-100 shadow-inner
                        ${isUnitCompleted ? 'bg-yellow-400 border-yellow-200' : 'bg-slate-50 opacity-40'}`}>
                        <Trophy size={48} className={isUnitCompleted ? 'text-white' : 'text-slate-300'} />
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Vault */}
      <AnimatePresence>
        {showAchievements && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAchievements(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-end justify-center p-4">
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-sm rounded-t-[3rem] p-8 pb-12 shadow-2xl">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Award className="text-yellow-500" /> මගේ ජයග්‍රහණ</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {Array.isArray(achievements) && achievements.map(a => (
                            <div key={a.id} className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${a.earned ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-50 grayscale'}`}>
                                <div className="text-4xl">{a.earned ? a.icon : '❓'}</div>
                                <div>
                                    <h4 className="font-black text-slate-800">{a.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-500">{a.desc}</p>
                                </div>
                                {a.earned && <CheckCircle2 className="ml-auto text-brand-green" size={20} />}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonPath;

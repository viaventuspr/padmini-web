import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Flame, Heart, CheckCircle2, Star, Award, X, Zap, BookOpen, Sparkles } from 'lucide-react';
import { usePadminiStore } from '../store';

// ── Lesson Card (Unique Card-Grid instead of Duolingo node-path) ──
const LessonCard = ({ theme, index, isLocked, isCompleted, onClick }) => {
  const iconBgs = [
    'from-lotus-500 to-lotus-600',
    'from-ocean-400 to-ocean-500',
    'from-gold-400 to-gold-500',
    'from-sunset-400 to-sunset-500',
    'from-emerald-400 to-emerald-500',
    'from-sky-400 to-sky-500',
    'from-rose-400 to-rose-500',
    'from-violet-400 to-violet-500',
  ];
<<<<<<< HEAD

  const avatarEmojis = { 
    owl: '🦉', 
    lion: '🦁', 
    butterfly: '🦋', 
    elephant: '🐘',
    fairy: <img src="/images/padmini_fairy.png" className="w-full h-full object-contain" alt="Padmini" />
  };
  const margins = ["ml-0", "ml-24", "ml-40", "ml-20", "ml-0", "-ml-20", "-ml-40", "-ml-24"];
=======
  const bg = iconBgs[index % iconBgs.length];
>>>>>>> padmini-v5-complete

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => !isLocked && onClick(theme.id)}
      disabled={isLocked}
      className={`w-full text-left transition-all duration-300 active:scale-[0.97]
        ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-card-hover'}`}
    >
      <div className={`solid-card p-4 flex items-center gap-4 ${isCompleted ? 'ring-2 ring-ocean-200 bg-ocean-50/30' : ''}`}>
        {/* Icon Circle */}
        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md
          ${isLocked ? 'bg-slate-100' : `bg-gradient-to-br ${bg} text-white`}`}>
          {isLocked ? <Lock size={22} className="text-slate-300" /> : (theme.icon || <BookOpen size={22} />)}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-ocean-500 flex items-center justify-center shadow-sm">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lotus-950 text-sm truncate leading-tight">{theme.title}</p>
          <p className="text-[10px] font-medium text-lotus-400 mt-0.5">
            {isCompleted ? '✓ සම්පූර්ණයි' : isLocked ? '🔒 අගුලු වී ඇත' : `ප්‍රශ්න ${theme.questions?.length || 0}ක්`}
          </p>
        </div>

        {/* Status */}
        {!isLocked && !isCompleted && (
          <div className="shrink-0 w-9 h-9 rounded-xl bg-lotus-50 flex items-center justify-center">
            <Zap size={18} className="text-lotus-500" />
          </div>
        )}
      </div>
    </motion.button>
  );
};

// ── Unit Section ──
const UnitSection = ({ unit, unitIndex, themes, completedLessonIds, lessons, onStartLesson }) => {
  const unitColors = [
    { gradient: 'from-lotus-600 to-lotus-500', accent: 'text-lotus-200', emoji: '🌿' },
    { gradient: 'from-ocean-500 to-ocean-400', accent: 'text-ocean-200', emoji: '🌊' },
    { gradient: 'from-gold-500 to-gold-400', accent: 'text-gold-200', emoji: '⭐' },
    { gradient: 'from-sunset-500 to-sunset-400', accent: 'text-sunset-200', emoji: '🌅' },
  ];
  const uc = unitColors[unitIndex % unitColors.length];

  return (
    <div className="mb-8">
      {/* Unit Header */}
      <div className={`bg-gradient-to-r ${uc.gradient} p-5 rounded-4xl mb-4 relative overflow-hidden shadow-lg`}>
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-3xl">{uc.emoji}</span>
          <div>
            <h2 className="text-lg font-black text-white leading-tight">{unit.title}</h2>
            <p className={`text-[10px] font-semibold ${uc.accent} uppercase tracking-wider mt-0.5`}>{unit.description || `ඒකකය ${unitIndex + 1}`}</p>
          </div>
        </div>
        <div className="absolute right-[-10px] bottom-[-10px] text-7xl opacity-10">{uc.emoji}</div>
      </div>

      {/* Lesson Cards Grid */}
      <div className="space-y-2.5">
        {themes.map((theme, lIdx) => {
          const globalIdx = lessons.findIndex(l => l.id === theme.id);
          const isLocked = !completedLessonIds.includes(theme.id) && (unitIndex !== 0 || lIdx !== 0) &&
            !completedLessonIds.includes(lessons[globalIdx - 1]?.id);
          const isCompleted = completedLessonIds.includes(theme.id);

          return (
            <LessonCard key={theme.id} theme={theme} index={lIdx} isLocked={isLocked}
              isCompleted={isCompleted} onClick={onStartLesson} />
          );
        })}
      </div>
    </div>
  );
};

// ── Main LessonPath ──
const LessonPath = ({ onStartLesson, lessons = [], allUnits = [] }) => {
  const store = usePadminiStore();
  const [selectedGrade, setSelectedGrade] = useState('All');

  const {
    completedLessonIds = [], xp = 0, streak = 0, userName = 'ළමයා',
    hearts = 5, avatarId = 'owl', level = 1, masteryPool = [],
    achievements = [], newAchievementNotif = null, clearAchievementNotif = () => {},
    setActiveLesson, setScreen
  } = store;

  const startMastery = () => {
    if (masteryPool.length === 0) return;
    const masteryUnit = {
      id: 'mastery',
      title: 'අමාරු ප්‍රශ්න පුහුණුව',
      icon: '🧠',
      questions: masteryPool.slice(0, 10),
      guidebook: {
        text: 'මේ ඔයාට කලින් වැරදුණු ප්‍රශ්න. අපි මේවා ආයෙත් පුහුණු වෙලා දක්ෂයෙක් වෙමු!',
        points: ['වැරදුණු තැන් හදාගමු', 'වැඩිපුර ලකුණු ලබාගමු', 'පද්මිනී ටීචර් ඔයාට උදව් කරයි']
      }
    };
    setActiveLesson(masteryUnit);
    setScreen('guide');
  };

  const [showAchievements, setShowAchievements] = useState(false);

  const avatarEmojis = { owl: '🦉', lion: '🦁', butterfly: '🦋', elephant: '🐘' };
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-app pb-32 font-sinhala overflow-x-hidden relative">
      {/* Ambient Orbs */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] orb-purple rounded-full -z-10"></div>
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] orb-teal rounded-full -z-10"></div>

      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievementNotif && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-4 right-4 z-[120] glass-card bg-lotus-950/90 backdrop-blur-xl text-white p-4 rounded-3xl flex items-center gap-4 border border-lotus-700/50">
            <div className="text-3xl">{newAchievementNotif.icon || '🏅'}</div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">නව ජයග්‍රහණයක්!</p>
              <h4 className="font-bold text-sm">{newAchievementNotif.title || 'ජයග්‍රහණයක්'}</h4>
            </div>
            <button onClick={clearAchievementNotif} className="p-1.5 text-lotus-400 hover:text-white"><X size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-lotus-100/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Left Stats */}
          <div className="flex items-center gap-2">
            <div className="chip bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 border border-orange-100">
              <Flame size={14} className="fill-orange-500" /> {streak}
            </div>
            <div className="chip bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 border border-rose-100">
              <Heart size={14} className="fill-rose-500" /> {hearts}
            </div>
          </div>

          {/* Center: Level */}
          <div className="chip bg-lotus-50 text-lotus-700 border border-lotus-100 font-extrabold">
            <Star size={14} className="fill-lotus-400 text-lotus-400" /> Lv.{level}
          </div>

          {/* Right: Avatar & Achievements */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAchievements(true)} className="chip bg-gold-50 text-gold-600 border border-gold-100">
              <Award size={14} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lotus-100 to-lotus-50 flex items-center justify-center text-2xl border border-lotus-100 shadow-sm">
              {avatarEmojis[avatarId]}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* ── Welcome / Progress Banner ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lotus-500 to-lotus-400 flex items-center justify-center text-3xl shadow-md">
              {avatarEmojis[avatarId]}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lotus-950">{userName} 👋</p>
              <p className="text-xs text-lotus-400 font-medium mt-0.5">සම්පූර්ණ කළ පාඩම්: {completedLessonIds.length}/{totalLessons}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gradient">{progressPercent}%</p>
              <p className="text-[9px] font-bold text-lotus-300 uppercase tracking-wider">ප්‍රගතිය</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2.5 bg-lotus-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-lotus-600 to-lotus-400 rounded-full" />
          </div>
        </motion.div>

        {/* ── Grade Chips ── */}
        <div className="flex gap-2 mb-6 no-scrollbar overflow-x-auto pb-1">
          {['All', '3', '4', '5'].map(g => (
            <button key={g} onClick={() => setSelectedGrade(g)}
              className={`chip whitespace-nowrap transition-all duration-300
                ${selectedGrade === g
                  ? 'bg-lotus-700 text-white shadow-glow-purple border-transparent'
                  : 'bg-white text-lotus-400 border border-lotus-100 hover:border-lotus-200'}`}>
              {g === 'All' ? 'සියල්ල' : `${g} ශ්‍රේණිය`}
            </button>
          ))}
        </div>

        {/* ── Units & Lessons ── */}
        {allUnits.map((unit, uIdx) => {
          const unitThemes = unit.themes || [];
          const visibleThemes = unitThemes.filter(t => selectedGrade === 'All' || String(t.grade).includes(String(selectedGrade)));
          if (visibleThemes.length === 0) return null;

          return (
            <UnitSection key={unit.id} unit={unit} unitIndex={uIdx} themes={visibleThemes}
              completedLessonIds={completedLessonIds} lessons={lessons} onStartLesson={onStartLesson} />
          );
        })}
      </div>

      {/* ── Achievements Modal ── */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAchievements(false)}
            className="fixed inset-0 bg-lotus-950/50 backdrop-blur-sm z-[150] flex items-end justify-center p-4">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 pb-10 shadow-2xl max-h-[70vh] overflow-y-auto">
              <div className="w-10 h-1 bg-lotus-100 rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-lotus-950">
                <Sparkles className="text-gold-500" size={22} /> මගේ ජයග්‍රහණ
              </h2>
              <div className="space-y-3">
                {Array.isArray(achievements) && achievements.length > 0 ? achievements.map(a => (
                  <div key={a.id} className={`p-4 rounded-2xl flex items-center gap-4 transition-all
                    ${a.earned ? 'glass-card shadow-card' : 'bg-slate-50 border border-slate-100 opacity-50'}`}>
                    <div className="text-3xl">{a.earned ? a.icon : '❓'}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-lotus-950">{a.title}</h4>
                      <p className="text-[10px] font-medium text-lotus-400">{a.desc}</p>
                    </div>
                    {a.earned && <CheckCircle2 className="text-ocean-500" size={18} />}
                  </div>
                )) : (
                  <p className="text-center text-lotus-300 font-medium py-8 text-sm">තවම ජයග්‍රහණ නැත.<br/>පාඩම් කර ජයග්‍රහණ දිනන්න!</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonPath;

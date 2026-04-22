import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Flame, Heart, CheckCircle2, Star, Award, X, Zap, BookOpen, Sparkles } from 'lucide-react';
import { usePadminiStore } from '../store';

// ── Lesson Card (Unique Card-Grid instead of Duolingo node-path) ──
// ── Theme Configurations ──
const UNIT_THEMES = {
  1: { // Tea Garden / Nature
    bgClass: 'bg-tea-garden',
    orbClass: 'orb-emerald',
    accentColor: 'emerald',
    gradient: 'from-emerald-600 to-teal-500',
    titleGradient: 'text-tea-gradient',
    emoji: '🍃',
    particle: '🌿'
  },
  2: { // Health
    bgClass: 'bg-rose-50/30',
    orbClass: 'orb-purple',
    accentColor: 'lotus',
    gradient: 'from-lotus-600 to-lotus-500',
    titleGradient: 'text-lotus-700',
    emoji: '🍎',
    particle: '✨'
  },
  3: { // Universe
    bgClass: 'bg-slate-50',
    orbClass: 'orb-teal',
    accentColor: 'ocean',
    gradient: 'from-ocean-600 to-sky-500',
    titleGradient: 'text-ocean-700',
    emoji: '🌌',
    particle: '⭐'
  },
  4: { // Heritage
    bgClass: 'bg-amber-50/50',
    orbClass: 'orb-gold',
    accentColor: 'gold',
    gradient: 'from-gold-600 to-orange-500',
    titleGradient: 'text-gold-700',
    emoji: '🏛️',
    particle: '☸️'
  }
};

const LessonCard = ({ theme, index, isLocked, isCompleted, onClick, unitTheme }) => {
  const ut = unitTheme || UNIT_THEMES[1];
  const margins = ["ml-0", "ml-12", "ml-24", "ml-12", "ml-0", "-ml-12", "-ml-24", "-ml-12"];
  const currentMargin = margins[index % margins.length];

  return (
    <div className={`flex flex-col items-center mb-10 ${currentMargin}`}>
      <motion.button
        whileHover={!isLocked ? { scale: 1.15 } : {}}
        whileTap={!isLocked ? { scale: 0.9 } : {}}
        onClick={() => !isLocked && onClick(theme.id)}
        disabled={isLocked}
        className={`relative z-10 
          ${isLocked ? 'opacity-50 grayscale' : ''}
          ${!isLocked && !isCompleted ? 'lotus-pulse' : ''}`}
      >
        {/* The Node Base (Lotus/Organic Shape) */}
        <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-3xl shadow-xl transition-all duration-500
          ${isLocked 
            ? 'bg-white border-4 border-slate-100 text-slate-300' 
            : isCompleted 
              ? `bg-gradient-to-br ${ut.gradient} text-white ring-8 ring-${ut.accentColor}-100` 
              : `bg-white border-4 border-${ut.accentColor}-400 text-${ut.accentColor}-600`}`}>
          
          {isLocked ? <Lock size={28} /> : (theme.icon || <BookOpen size={28} />)}
          
          {/* Status Overlay */}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
              <CheckCircle2 size={16} className={`text-${ut.accentColor}-600`} />
            </div>
          )}
        </div>

        {/* Floating Particle */}
        {!isLocked && (
          <motion.div 
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -right-4 -top-4 text-xl opacity-40">
            {ut.particle}
          </motion.div>
        )}
      </motion.button>

      {/* Label */}
      <div className="mt-3 text-center max-w-[120px]">
        <p className={`font-black text-xs leading-tight ${isLocked ? 'text-slate-400' : 'text-lotus-950'}`}>
          {theme.title}
        </p>
      </div>
    </div>
  );
};

// ── Unit Section ──
const UnitSection = ({ unit, unitIndex, themes, completedLessonIds, lessons, onStartLesson }) => {
  const ut = UNIT_THEMES[unit.id] || UNIT_THEMES[1];

  return (
    <div className={`mb-16 relative py-10 rounded-[3rem] overflow-hidden ${ut.bgClass} organic-shadow border border-white/50`}>
      {/* Unit Floating Orbs */}
      <div className={`absolute top-0 right-0 w-40 h-40 ${ut.orbClass} rounded-full blur-3xl opacity-50`} />
      
      {/* Unit Header */}
      <div className="relative z-10 px-8 mb-12 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${ut.gradient} text-white flex items-center justify-center text-3xl shadow-lg mb-4`}>
          {ut.emoji}
        </motion.div>
        <h2 className={`text-2xl font-black ${ut.titleGradient} leading-tight`}>{unit.title}</h2>
        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{unit.description}</p>
        
        {/* Decorative Path Line SVG (Simplified conceptual curve) */}
        <div className="absolute top-40 bottom-0 left-1/2 -translate-x-1/2 border-l-4 border-dashed border-slate-200/50 -z-0 h-full w-px" />
      </div>

      {/* Lesson Nodes Path */}
      <div className="relative z-10 flex flex-col items-center">
        {themes.map((theme, lIdx) => {
          const globalIdx = lessons.findIndex(l => l.id === theme.id);
          const isLocked = !completedLessonIds.includes(theme.id) && (unitIndex !== 0 || lIdx !== 0) &&
            !completedLessonIds.includes(lessons[globalIdx - 1]?.id);
          const isCompleted = completedLessonIds.includes(theme.id);

          return (
            <LessonCard 
              key={theme.id} 
              theme={theme} 
              index={lIdx} 
              isLocked={isLocked}
              isCompleted={isCompleted} 
              onClick={onStartLesson}
              unitTheme={ut}
            />
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

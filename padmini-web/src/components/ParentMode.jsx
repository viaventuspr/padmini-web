import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Clock, AlertTriangle, BookOpen, Star, Target, CheckCircle2 } from 'lucide-react';
import { usePadminiStore } from '../store';

const ProgressMeter = ({ value, label, color }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full rotate-[-90deg]">
        <circle cx="32" cy="32" r="28" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
        <motion.circle
          cx="32" cy="32" r="28" fill="transparent"
          stroke={color} strokeWidth="6"
          strokeDasharray={175.9}
          initial={{ strokeDashoffset: 175.9 }}
          animate={{ strokeDashoffset: 175.9 - (175.9 * value) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-black text-slate-700">{value}%</span>
    </div>
    <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{label}</span>
  </div>
);

const ParentMode = ({ onBack }) => {
  const store = usePadminiStore();
  // Safe destructuring with default values
  const {
    mistakesByTheme = {},
    totalStudyTime = 0,
    userName = "ළමයා",
    xp = 0,
    completedLessonIds = []
  } = store;

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  // Safe entries handling to prevent TypeError
  const themesWithMistakes = mistakesByTheme ? Object.entries(mistakesByTheme).sort((a, b) => b[1] - a[1]) : [];
  const completedPercentage = Math.round(((completedLessonIds?.length || 0) / 16) * 100);

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala text-slate-800">
      <header className="p-6 bg-white border-b-4 border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-black uppercase tracking-tight">දරුවාගේ ප්‍රගතිය</h1>
        </div>
        <div className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 flex items-center gap-1">
            <Star className="text-yellow-500 fill-yellow-500" size={14} />
            <span className="text-xs font-black text-yellow-600">{xp}</span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-6 pb-20">
        {/* Welcome Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-50 flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg border-4 border-blue-50">
                {userName?.charAt(0) || 'U'}
            </div>
            <div>
                <h2 className="text-xl font-black">{userName}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">මේ සතියේ සක්‍රීයයි</p>
            </div>
        </div>

        {/* Mastery Meters */}
        <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100">
            <ProgressMeter value={completedPercentage} label="Syllabus" color="#58CC02" />
            <ProgressMeter value={Math.min(100, Math.round(xp / 10))} label="Expertise" color="#1CB0F6" />
            <ProgressMeter value={100 - (themesWithMistakes.length * 5)} label="Accuracy" color="#FF4B4B" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex flex-col gap-2">
                <Clock className="text-blue-500" size={24} />
                <p className="text-2xl font-black">{formatTime(totalStudyTime)}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase">මුළු කාලය</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 flex flex-col gap-2">
                <Target className="text-green-500" size={24} />
                <p className="text-2xl font-black">{completedLessonIds?.length || 0}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase">නිමකළ පාඩම්</p>
            </div>
        </div>

        {/* Difficult Themes List */}
        <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-400" /> වැඩි අවධානයක් අවශ්‍ය පාඩම්
            </h3>

            {themesWithMistakes.length > 0 ? (
                <div className="space-y-3">
                    {themesWithMistakes.map(([theme, count]) => (
                        <div key={theme} className="bg-white p-5 rounded-2xl border-2 border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <BookOpen size={20} />
                                </div>
                                <span className="font-bold text-slate-700">{theme}</span>
                            </div>
                            <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                <span className="text-xs font-black text-orange-600">{count} වැරදීම්</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 text-center">
                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-400 font-bold leading-relaxed">සියලුම පාඩම් ඉතා දක්ෂ ලෙස නිම කර ඇත! ✨</p>
                </div>
            )}
        </section>

        {/* Padmini Insight */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] text-white">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">පද්මිනී AI උපදෙස</p>
            <p className="text-sm leading-relaxed italic">
                "{userName} ඉතාමත් හොඳින් ඉගෙන ගනිමින් සිටී. {themesWithMistakes.length > 0 ? `${themesWithMistakes[0][0]} පිළිබඳව තවදුරටත් පුහුණු කරවීම සුදුසුයි.` : 'දිගටම දිරිමත් කරන්න!'}"
            </p>
        </div>
      </main>
    </div>
  );
};

export default ParentMode;

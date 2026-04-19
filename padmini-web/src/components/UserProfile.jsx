import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Award, Zap, Heart, Star, Edit2, 
  ChevronLeft, Settings, Share2, Calendar,
  Trophy, BookOpen, Clock, ShieldCheck
} from 'lucide-react';
import { usePadminiStore } from '../store';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-2xl ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-slate-800">{value}</p>
    </div>
  </div>
);

const UserProfile = ({ onBack }) => {
  const store = usePadminiStore();
  const { 
    userName, avatarId, xp, level, gems, streak, 
    completedLessonIds, totalStudyTime, achievements 
  } = store;

  const [isEditing, setIsEditing] = useState(false);
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);
  const [editedName, setEditedName] = useState(userName);

  const avatars = [
    { id: 'fairy', emoji: '🧚‍♀️' },
    { id: 'owl', emoji: '🦉' },
    { id: 'lion', emoji: '🦁' },
    { id: 'butterfly', emoji: '🦋' },
    { id: 'elephant', emoji: '🐘' },
  ];

  const handleAvatarSelect = (id) => {
    store.setAvatar(id);
    setIsChoosingAvatar(false);
    store.saveProgressToCloud();
  };

  const avatarEmojis = { 
    owl: '🦉', 
    lion: '🦁', 
    butterfly: '🦋', 
    elephant: '🐘',
    fairy: <img src="/images/padmini_fairy.png" className="w-full h-full object-contain" alt="Padmini" />
  };

  const handleSave = () => {
    store.setUserName(editedName);
    store.saveProgressToCloud();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFEF7] pb-20">
      <AnimatePresence>
        {isChoosingAvatar && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-black mb-6 text-center">ඔයාගේ රූපය තෝරන්න</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {avatars.map(a => (
                            <button key={a.id} onClick={() => handleAvatarSelect(a.id)} className={`aspect-square rounded-2xl flex items-center justify-center text-4xl border-4 transition-all ${avatarId === a.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}>
                                {a.id === 'fairy' ? <img src="/images/padmini_fairy.png" className="w-12 h-12 object-contain" /> : a.emoji}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setIsChoosingAvatar(false)} className="w-full mt-6 py-3 font-black text-slate-400">පසුවට</button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      {/* Header Area */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 p-6 pb-24 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-8 border-white animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-4 border-white opacity-20"></div>
        </div>

        <div className="flex justify-between items-center relative z-10 text-white mb-8">
          <button onClick={onBack} className="p-2 bg-white/20 rounded-xl backdrop-blur-md hover:bg-white/30 transition-all">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-black font-sinhala tracking-tight">මගේ ගිණුම</h1>
          <button className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Settings size={24} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChoosingAvatar(true)}
            className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-white overflow-hidden p-2 mb-4 cursor-pointer relative group"
          >
            {avatarEmojis[avatarId] || '🦉'}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Edit2 className="text-white" size={24} />
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-lg">
                <input 
                  type="text" 
                  value={editedName} 
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-transparent outline-none font-bold text-slate-800 px-2 w-32"
                />
                <button onClick={handleSave} className="bg-green-500 text-white p-1 rounded-lg"><ShieldCheck size={20} /></button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-white">{userName}</h2>
                <button onClick={() => setIsEditing(true)} className="text-white/70 hover:text-white"><Edit2 size={18} /></button>
              </>
            )}
          </div>
          <p className="text-blue-100 font-bold text-xs uppercase tracking-[0.2em]">Level {level} Explorer</p>
        </div>
      </div>

      {/* Main Stats Container */}
      <div className="max-w-md mx-auto px-6 -mt-16 relative z-20 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={Zap} label="මුළු XP" value={xp} colorClass="bg-orange-500" />
          <StatCard icon={Trophy} label="දින ගණන" value={streak} colorClass="bg-yellow-500" />
          <StatCard icon={BookOpen} label="පාඩම්" value={completedLessonIds.length} colorClass="bg-blue-500" />
          <StatCard icon={Clock} label="ඉගෙනුම් කාලය" value={`${Math.floor((totalStudyTime || 0) / 60)} min`} colorClass="bg-purple-500" />
        </div>

        {/* Achievement Badges Showcase */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><Award className="text-yellow-500" /> මගේ ජයග්‍රහණ</h3>
            <button className="text-blue-500 text-[10px] font-black uppercase">පොත බලන්න</button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {Array.isArray(achievements) && achievements.slice(0, 4).map((badge, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all
                  ${badge.earned ? 'bg-yellow-50 border-2 border-yellow-200 shadow-sm' : 'bg-slate-50 opacity-30 grayscale'}`}
              >
                {badge.earned ? badge.icon : '❓'}
              </motion.div>
            ))}
            {achievements.length === 0 && (
              <p className="col-span-4 text-center py-4 text-slate-400 text-xs font-bold font-sinhala">තවම ජයග්‍රහණ ලබා නැත. පාඩම් කර ජයග්‍රහණ ලබා ගනිමු!</p>
            )}
          </div>
        </div>

        <button 
          onClick={() => {}} 
          className="w-full py-4 bg-white border-b-8 border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-black text-slate-600 hover:bg-slate-50 transition-all active:border-b-0 active:translate-y-2"
        >
          <Share2 size={20} />
          ජයග්‍රහණ බෙදා ගන්න
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-sinhala { font-family: 'Noto Sans Sinhala', sans-serif; }
      `}} />
    </div>
  );
};

export default UserProfile;

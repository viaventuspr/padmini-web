import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
<<<<<<< HEAD
import { Trophy, Medal, Crown, ArrowLeft, Star, Loader2 } from 'lucide-react';
=======
import { Trophy, Crown, ArrowLeft, Star, Loader2 } from 'lucide-react';
>>>>>>> padmini-v5-complete
import ApiService from '../services/api';
import { usePadminiStore } from '../store';

const Leaderboard = ({ onBack }) => {
  const [leaders, setLeaders] = useState([]);
  const { userId } = usePadminiStore();

  useEffect(() => {
<<<<<<< HEAD
    const unsubscribe = ApiService.getLeaderboard((data) => {
      setLeaders(data);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const isOnline = (isoString) => {
    if (!isoString) return false;
    const diff = new Date() - new Date(isoString);
    return diff < 15 * 60 * 1000; // 15 mins
  };

  const activeUsers = leaders.filter(u => isOnline(u.lastActive));
=======
    const unsubscribe = ApiService.getLeaderboard((data) => setLeaders(data));
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
>>>>>>> padmini-v5-complete

  return (
    <div className="fixed inset-0 bg-app z-[100] flex flex-col max-w-lg mx-auto overflow-hidden font-sinhala">
      {/* Header */}
      <header className="p-4 bg-white/80 backdrop-blur-xl border-b border-lotus-100/50 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-lotus-50 flex items-center justify-center text-lotus-400 hover:text-lotus-700 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-lotus-950 flex items-center gap-2">
          <Trophy className="text-gold-500" size={20} /> දක්ෂයන්ගේ පුවරුව
        </h1>
      </header>

<<<<<<< HEAD
      <main className="flex-1 p-6 overflow-y-auto space-y-4 pb-32 text-slate-800">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-[2.5rem] text-white text-center shadow-xl mb-4 relative overflow-hidden">
            <Crown size={48} className="mx-auto mb-2 opacity-80 animate-bounce" />
            <h2 className="text-2xl font-black italic">රන් ලීගය (Gold League)</h2>
            <p className="text-xs font-bold opacity-90 uppercase tracking-widest mt-1">පන්තියේ දක්ෂතම සිසුන් 10 දෙනා</p>
            <div className="absolute -right-5 -bottom-5 text-9xl opacity-10">🏆</div>
        </div>
=======
      <main className="flex-1 p-4 overflow-y-auto pb-16">
        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gold-500 to-gold-400 p-6 rounded-4xl text-white text-center mb-6 relative overflow-hidden shadow-glow-gold">
          <Crown size={36} className="mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-black">රන් ලීගය</h2>
          <p className="text-[10px] font-semibold opacity-80 uppercase tracking-widest mt-1">පන්තියේ දක්ෂතම සිසුන් 10 දෙනා</p>
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">🏆</div>
        </motion.div>
>>>>>>> padmini-v5-complete

        {/* ── Active Friends Section ── */}
        {activeUsers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> දැන් ඉගෙන ගන්නා යාළුවෝ
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {activeUsers.map(user => (
                <div key={user.id} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border-2 border-slate-100 flex items-center justify-center text-2xl">
                      {user.avatarEmoji || "🦉"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 max-w-[60px] truncate">{user.userName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {leaders.length > 0 ? (
          <div className="space-y-2.5">
            {leaders.map((user, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                key={user.id}
                className={`solid-card p-4 flex items-center gap-3 transition-all
                  ${user.id === userId ? 'ring-2 ring-lotus-400 shadow-glow-purple bg-lotus-50/30' : ''}`}>
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                  ${index < 3 ? 'text-2xl' : 'bg-lotus-50 text-lotus-300'}`}>
                  {index < 3 ? medals[index] : index + 1}
                </div>
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-lotus-100 to-lotus-50 rounded-xl flex items-center justify-center text-xl border border-lotus-100">
                  {user.avatarEmoji || '🦉'}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-lotus-950 truncate">{user.userName} {user.id === userId && '(ඔබ)'}</p>
                  <p className="text-[10px] font-medium text-lotus-300">Level {user.level || 1}</p>
                </div>
                {/* XP */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-gold-500 font-extrabold text-sm">
                    <Star size={14} className="fill-gold-400" /> {user.xp}
                  </div>
                  <p className="text-[8px] font-bold text-lotus-200 uppercase">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Loader2 className="animate-spin mx-auto text-lotus-200 mb-4" size={36} />
            <p className="text-lotus-300 font-semibold text-sm">දත්ත ලබා ගනිමින්...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;

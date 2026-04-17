import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowLeft, Star } from 'lucide-react';
import ApiService from '../services/api';
import { usePadminiStore } from '../store';

const Leaderboard = ({ onBack }) => {
  const [leaders, setLeaders] = useState([]);
  const { userId } = usePadminiStore();

  useEffect(() => {
    // සජීවීව ලකුණු පුවරුව ලබා ගැනීම
    const unsubscribe = ApiService.getLeaderboard((data) => {
      setLeaders(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala">
      <header className="p-6 bg-white border-b-4 border-slate-100 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition p-1"><ArrowLeft size={28} /></button>
        <h1 className="text-xl font-black text-slate-800 uppercase flex items-center gap-2">
          <Trophy className="text-yellow-500" /> දක්ෂයන්ගේ පුවරුව
        </h1>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-4 pb-32 text-slate-800">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-[2.5rem] text-white text-center shadow-xl mb-8 relative overflow-hidden">
            <Crown size={48} className="mx-auto mb-2 opacity-80 animate-bounce" />
            <h2 className="text-2xl font-black italic">රන් ලීගය (Gold League)</h2>
            <p className="text-xs font-bold opacity-90 uppercase tracking-widest mt-1">පන්තියේ දක්ෂතම සිසුන් 10 දෙනා</p>
            <div className="absolute -right-5 -bottom-5 text-9xl opacity-10">🏆</div>
        </div>

        {leaders.length > 0 ? (
          leaders.map((user, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={user.id}
              className={`p-5 rounded-[1.5rem] border-2 border-b-8 flex items-center gap-4 transition-all
                ${user.id === userId ? 'bg-blue-50 border-brand-sky scale-105 z-10' : 'bg-white border-slate-100'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-slate-300 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {index + 1}
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                {user.avatarEmoji || "🦉"}
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-700">{user.userName} {user.id === userId && "(ඔබ)"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Level {user.level || 1}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-brand-sun font-black">
                    <Star size={14} fill="currentColor" />
                    <span>{user.xp}</span>
                </div>
                <p className="text-[8px] font-bold text-slate-300 uppercase">XP ලකුණු</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20">
            <Loader2 className="animate-spin mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">දත්ත ලබා ගනිමින්...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;

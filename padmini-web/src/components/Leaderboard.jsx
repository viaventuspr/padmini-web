import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, ArrowLeft, Star, Loader2, Users } from 'lucide-react';
import ApiService from '../services/api';
import { usePadminiStore } from '../store';

const Leaderboard = ({ onBack }) => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = usePadminiStore();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = ApiService.getLeaderboard((data) => {
      setLeaders(data);
      setIsLoading(false);
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  const isOnline = (isoString) => {
    if (!isoString) return false;
    const diff = new Date() - new Date(isoString);
    return diff < 15 * 60 * 1000; // 15 mins
  };

  const activeUsers = leaders.filter(u => isOnline(u.lastActive));

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[100] flex flex-col max-w-lg mx-auto overflow-hidden font-sinhala">
      {/* Header */}
      <header className="p-4 bg-white border-b-2 border-slate-100 flex items-center gap-3 relative z-10">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} /> දක්ෂයන්ගේ පුවරුව
        </h1>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-6 pb-20">
        {/* Banner Card */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-[2.5rem] text-white text-center shadow-xl relative overflow-hidden"
        >
          <Crown size={48} className="mx-auto mb-2 opacity-90 animate-bounce" />
          <h2 className="text-2xl font-black italic">රන් ලීගය (Gold)</h2>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">පන්තියේ දක්ෂතම සිසුන් 10 දෙනා</p>
          <div className="absolute -right-6 -bottom-6 text-9xl opacity-10">🏆</div>
        </motion.div>

        {/* ── Active Friends Section ── */}
        {activeUsers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> දැන් ඉගෙන ගන්නා යාළුවෝ
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {activeUsers.map(user => (
                <div key={user.id} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border-2 border-slate-100 flex items-center justify-center text-2xl overflow-hidden">
                       {user.avatarId === 'fairy' ? <img src="/images/padmini_fairy.png" className="w-10 h-10 object-contain" /> : (user.avatarEmoji || "🦉")}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 max-w-[60px] truncate">{user.userName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaders List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-[#58CC02] animate-spin" />
            <p className="text-slate-400 font-bold font-sinhala">දත්ත ලබා ගනිමින්...</p>
          </div>
        ) : leaders.length > 0 ? (
          <div className="space-y-3">
            {leaders.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white p-4 rounded-[2rem] flex items-center gap-4 border-2 transition-all
                  ${user.id === userId ? 'border-blue-500 shadow-lg bg-blue-50/30' : 'border-slate-50 shadow-sm'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm
                  ${index < 3 ? 'text-3xl' : 'bg-slate-50 text-slate-400'}`}>
                  {index < 3 ? medals[index] : index + 1}
                </div>

                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border-2 border-white overflow-hidden">
                  {user.avatarId === 'fairy' ? <img src="/images/padmini_fairy.png" className="w-10 h-10 object-contain" /> : (user.avatarEmoji || '🦉')}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 truncate">{user.userName} {user.id === userId && '(ඔබ)'}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Level {user.level || 1}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-orange-500 font-black text-lg">
                    <Star size={16} className="fill-orange-500" /> {user.xp}
                  </div>
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">XP Points</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Users size={40} />
             </div>
             <h3 className="text-lg font-black text-slate-800">තවම කවුරුත් නැහැ</h3>
             <p className="text-sm text-slate-400 font-bold">ඔබ පළමුවැනියා වෙන්න! පාඩම් ආරම්භ කර ලකුණු ලබා ගන්න.</p>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default Leaderboard;

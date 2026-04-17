import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Trophy } from 'lucide-react';
import { usePadminiStore } from '../store';

const LessonCompletion = ({ score, total, onContinue }) => {
  const { streak, xp } = usePadminiStore();
  const accuracy = Math.round((score / total) * 100);

  useEffect(() => {
    // Dynamic import confetti to prevent crash if not installed
    import('canvas-confetti').then((confetti) => {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }).catch(err => {
      console.warn("Confetti effect skipped: library not found.");
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[70] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto overflow-hidden font-sinhala">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="mb-8"
      >
        <Trophy size={120} className="text-yellow-400 drop-shadow-xl" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black text-[#58CC02] mb-10"
      >
        පාඩම අවසන්!
      </motion.h1>

      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        <div className="bg-white border-2 border-b-8 border-slate-100 p-6 rounded-[2rem] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">එකතු කළ XP</p>
          <div className="flex items-center justify-center gap-2 text-slate-700">
            <Star className="text-yellow-400 fill-yellow-400" size={20} />
            <span className="text-2xl font-black">{score * 10}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-b-8 border-slate-100 p-6 rounded-[2rem] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">නිවැරදි බව</p>
          <span className="text-2xl font-black text-[#58CC02]">{accuracy}%</span>
        </div>
      </div>

      <div className="bg-orange-50 border-2 border-b-8 border-orange-100 p-6 rounded-[2rem] w-full mb-12 flex items-center justify-between">
        <div className="text-left text-orange-600">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">දිනපතා පැමිණීම</p>
          <p className="text-xl font-black">දින {streak} ක ජයක්!</p>
        </div>
        <Flame size={48} className="text-orange-500 fill-orange-500" />
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-[#58CC02] border-b-8 border-[#46A302] py-5 rounded-2xl text-2xl font-black text-white shadow-xl active:translate-y-2 active:border-b-0 transition-all uppercase tracking-widest"
      >
        ඉදිරියට යමු
      </button>
    </div>
  );
};

export default LessonCompletion;

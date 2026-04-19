import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Zap, Clock, Target, Star, Trophy, Gem, Sparkles, ChevronRight } from 'lucide-react';
import { usePadminiStore } from '../store';

const SuccessScreen = ({ score, total, timeSpent, onContinue }) => {
  const [chestOpened, setChestOpened] = useState(false);
  const { addGems, xp } = usePadminiStore();

  const accuracy = Math.round((score / total) * 100);
  const xpEarned = score * 10;
  const bonusGems = Math.floor(score / 2) + (score === total ? 10 : 0);

  useEffect(() => {
    // Initial celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#58CC02', '#FFD700', '#1CB0F6']
    });
  }, []);

  const handleOpenChest = () => {
    if (chestOpened) return;
    setChestOpened(true);
    addGems(bonusGems);

    // Victory celebration
    const end = Date.now() + 2 * 1000;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[100] flex flex-col items-center justify-between p-8 text-center max-w-md mx-auto overflow-hidden font-sinhala">
      <div className="w-full flex-1 flex flex-col items-center justify-center space-y-10">

        {/* Magic Chest or Trophy */}
        <div className="relative cursor-pointer" onClick={handleOpenChest}>
          <AnimatePresence mode="wait">
            {!chestOpened ? (
              <motion.div
                key="closed"
                initial={{ scale: 0.8 }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, -3, 3, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="text-9xl filter drop-shadow-2xl">🎁</div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-6 -right-6 bg-rose-500 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-xl border-4 border-white uppercase tracking-tighter"
                >
                  එබන්න!
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="opened"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <Trophy size={140} className="text-yellow-400 drop-shadow-2xl mb-4" />
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: -40, opacity: 1 }}
                  className="flex items-center gap-2 text-4xl font-black text-brand-sky"
                >
                  <Gem fill="currentColor" size={32} /> +{bonusGems}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
            <motion.div 
               initial={{ scale: 0.5, opacity: 0, rotate: -15 }} 
               animate={{ scale: 1, opacity: 1, rotate: 0 }}
               className="w-32 h-32 mx-auto relative mb-4"
            >
               <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
               <img src="/images/padmini_fairy.png" className="w-full h-full object-contain relative z-10" alt="Victory" />
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-[#58CC02] uppercase tracking-tight"
            >
                {score === total ? 'විශිෂ්ටයි!' : 'නියමයි!'}
            </motion.h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">පාඩම සාර්ථකව අවසන් කළා</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: "XP ලකුණු", val: xpEarned, ico: Zap, color: "text-yellow-600", bg: "bg-yellow-100" },
            { label: "ගතවූ කාලය", val: timeSpent, ico: Clock, color: "text-blue-600", bg: "bg-blue-100" },
            { label: "නිරවද්‍යතාවය", val: `${accuracy}%`, ico: Target, color: "text-green-600", bg: "bg-green-100" }
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="bg-white border-2 border-b-8 border-slate-100 p-4 rounded-[2rem] shadow-sm flex flex-col items-center gap-2"
            >
              <div className={`w-10 h-10 ${s.bg} rounded-2xl flex items-center justify-center ${s.color}`}>
                <s.ico fill={i === 0 ? "currentColor" : "none"} size={20} strokeWidth={3} />
              </div>
              <span className="text-lg font-black text-slate-700">{s.val}</span>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="w-full space-y-6 pt-10">
        <p className="text-slate-500 font-bold italic text-sm px-6">
          "{score === total ? 'ඔයා අද ඔක්කොම ප්‍රශ්න හරියටම කළා! මාරයි!' : 'ඔයා අද ගොඩක් දේවල් ඉගෙන ගත්තා. ගුරුතුමියට සතුටුයි!'}"
        </p>

        <button
          onClick={onContinue}
          disabled={!chestOpened}
          className={`w-full py-5 rounded-2xl text-2xl font-black text-white shadow-2xl active:translate-y-2 active:border-b-0 transition-all uppercase tracking-widest border-b-8
            ${chestOpened ? 'bg-[#1CB0F6] border-[#1899D6] hover:brightness-110' : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'}`}
        >
          {chestOpened ? 'ඉදිරියට යමු' : 'තෑග්ග ලබා ගන්න'}
        </button>
      </footer>
    </div>
  );
};

export default SuccessScreen;

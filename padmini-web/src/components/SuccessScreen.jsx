import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Zap, Clock, Target, Trophy, Gem, ArrowRight } from 'lucide-react';
import { usePadminiStore } from '../store';

const SuccessScreen = ({ score, total, timeSpent, onContinue }) => {
  const [chestOpened, setChestOpened] = useState(false);
  const { addGems } = usePadminiStore();

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const xpEarned = score * 10;
  const bonusGems = Math.floor(score / 2) + (score === total ? 10 : 0);

  useEffect(() => {
    // 🚀 Celebratory Confetti Rain on Mount
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#58CC02', '#FFD700', '#1CB0F6', '#FF4B4B']
    });
  }, []);

  const handleOpenChest = () => {
    if (chestOpened) return;
    setChestOpened(true);
    addGems(bonusGems);
    
    // Extra celebration on chest open
    const end = Date.now() + 1500;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#58CC02', '#FFD700'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#1CB0F6', '#FF4B4B'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[100] flex flex-col items-center justify-between p-6 text-center max-w-lg mx-auto overflow-hidden font-sinhala">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-yellow-200/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-green-200/20 blur-3xl rounded-full"></div>

      <div className="w-full flex-1 flex flex-col items-center justify-center space-y-8 relative z-10 pt-8">
        
        {/* Fairy Victory Character */}
        <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 50 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-40 h-40 relative"
        >
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
            <img src="/images/padmini_fairy.png" className="w-full h-full object-contain relative z-10" alt="Victory" />
        </motion.div>

        <div>
            <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-4xl font-black text-[#58CC02] uppercase tracking-tight">
                {score === total ? 'විශිෂ්ටයි!' : 'නියමයි!'}
            </motion.h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">පාඩම සාර්ථකව අවසන් කළා</p>
        </div>

        {/* Reward Chest */}
        <div className="cursor-pointer" onClick={handleOpenChest}>
          <AnimatePresence mode="wait">
            {!chestOpened ? (
              <motion.div key="closed" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="relative">
                <div className="text-7xl filter drop-shadow-lg">🎁</div>
                <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce">තෑග්ග ගන්න!</div>
              </motion.div>
            ) : (
              <motion.div key="opened" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <Trophy size={80} className="text-yellow-500 mb-2" />
                <div className="flex items-center gap-1 text-2xl font-black text-orange-500">
                  <Gem size={20} className="fill-orange-500" /> +{bonusGems}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: 'XP ලකුණු', val: xpEarned, ico: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'ගත වූ කාලය', val: timeSpent, ico: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'නිරවද්‍යතාවය', val: `${accuracy}%`, ico: Target, color: 'text-green-500', bg: 'bg-green-50' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className={`${s.bg} p-4 rounded-[2rem] border-2 border-white shadow-sm flex flex-col items-center gap-1`}>
              <s.ico size={16} className={s.color} />
              <span className="text-lg font-black text-slate-800">{s.val}</span>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="w-full pb-8 relative z-10 px-4">
        <p className="text-slate-500 font-bold italic text-xs mb-6 px-4">
          "{score === total ? 'ඔයා අද සියලුම ප්‍රශ්න හරියටම කළා!' : 'ඔයා අද ගොඩක් දේවල් ඉගෙන ගත්තා. ගුරුතුමියට සතුටුයි!'}"
        </p>
        <button 
            onClick={onContinue} 
            disabled={!chestOpened}
            className={`w-full py-5 rounded-3xl text-lg font-black transition-all flex items-center justify-center gap-2 shadow-lg
            ${chestOpened ? 'bg-[#58CC02] text-white border-b-8 border-[#46A302] active:border-b-0 active:translate-y-1' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
        >
          {chestOpened ? <>ඉදිරියට <ArrowRight size={24} /></> : 'තෑග්ගා ලබා ගන්න...'}
        </button>
      </footer>
    </div>
  );
};

export default SuccessScreen;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Zap, Clock, Target, Trophy, Gem, ArrowRight } from 'lucide-react';
import { usePadminiStore } from '../store';

const SuccessScreen = ({ score, total, timeSpent, onContinue }) => {
  const [chestOpened, setChestOpened] = useState(false);
  const { addGems, xp } = usePadminiStore();

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const xpEarned = score * 10;
  const bonusGems = Math.floor(score / 2) + (score === total ? 10 : 0);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#A855F7', '#F59E0B', '#14B8A6', '#7C3AED']
    });
  }, []);

  const handleOpenChest = () => {
    if (chestOpened) return;
    setChestOpened(true);
    addGems(bonusGems);
    const end = Date.now() + 2000;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#A855F7', '#F59E0B'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#14B8A6', '#7C3AED'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  return (
    <div className="fixed inset-0 bg-app z-[100] flex flex-col items-center justify-between p-6 text-center max-w-lg mx-auto overflow-hidden font-sinhala">
      {/* Ambient */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] orb-purple rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] orb-gold rounded-full"></div>

      <div className="w-full flex-1 flex flex-col items-center justify-center space-y-8 relative z-10">
        {/* Chest / Trophy */}
        <div className="relative cursor-pointer" onClick={handleOpenChest}>
          <AnimatePresence mode="wait">
            {!chestOpened ? (
              <motion.div key="closed" animate={{ y: [0, -12, 0], rotate: [0, -2, 2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }} className="relative">
                <div className="absolute inset-0 bg-gold-400/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="text-8xl filter drop-shadow-2xl">🎁</div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-lotus-600 to-lotus-500 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-full shadow-lg">
                  එබන්න!
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="opened" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center">
                <Trophy size={100} className="text-gold-400 drop-shadow-2xl mb-2" />
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: -20, opacity: 1 }}
                  className="flex items-center gap-2 text-3xl font-black text-lotus-600">
                  <Gem className="fill-lotus-400" size={24} /> +{bonusGems}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

<<<<<<< HEAD
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
=======
        {/* Title */}
        <div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-gradient uppercase tracking-tight">
            {score === total ? 'විශිෂ්ටයි!' : 'නියමයි!'}
          </motion.h1>
          <p className="text-lotus-400 font-semibold text-xs mt-1">පාඩම සාර්ථකව අවසන් කළා</p>
>>>>>>> padmini-v5-complete
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: 'XP ලකුණු', val: xpEarned, ico: Zap, gradient: 'from-gold-100 to-gold-50', color: 'text-gold-600' },
            { label: 'ගත වූ කාලය', val: timeSpent, ico: Clock, gradient: 'from-lotus-100 to-lotus-50', color: 'text-lotus-600' },
            { label: 'නිරවද්‍යතාවය', val: `${accuracy}%`, ico: Target, gradient: 'from-ocean-100 to-ocean-50', color: 'text-ocean-600' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`bg-gradient-to-b ${s.gradient} p-4 rounded-3xl flex flex-col items-center gap-2 border border-white/50`}>
              <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${s.color} shadow-sm`}>
                <s.ico size={18} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-black text-lotus-950">{s.val}</span>
              <p className="text-[8px] font-bold text-lotus-400 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full space-y-4 pt-6 relative z-10">
        <p className="text-lotus-400 font-semibold italic text-sm px-4">
          "{score === total ? 'ඔයා අද සියලුම ප්‍රශ්න හරියටම කළා!' : 'ඔයා අද ගොඩක් දේවල් ඉගෙන ගත්තා. ගුරුතුමියට සතුටුයි!'}"
        </p>
        <button onClick={onContinue} disabled={!chestOpened}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2
            ${chestOpened ? 'btn-action' : 'bg-lotus-100 text-lotus-300 cursor-not-allowed'}`}>
          {chestOpened ? <>ඉදිරියට යමු <ArrowRight size={20} /></> : 'තෑග්ග ලබා ගන්න 🎁'}
        </button>
      </footer>
    </div>
  );
};

export default SuccessScreen;

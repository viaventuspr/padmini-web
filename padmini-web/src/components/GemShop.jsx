import React from 'react';
import { motion } from 'framer-motion';
import { Gem, ArrowLeft, ShoppingBag, Sparkles, Heart, Flame } from 'lucide-react';
import { usePadminiStore } from '../store';

const shopItems = [
  { id: 'cat', emoji: '🐱', name: 'සුරතල් පූසා', price: 50, type: 'avatar' },
  { id: 'panda', emoji: '🐼', name: 'හුරතල් පැන්ඩා', price: 100, type: 'avatar' },
  { id: 'dragon', emoji: '🐲', name: 'වීර මකරා', price: 200, type: 'avatar' },
  { id: 'streak_freeze', emoji: '🧊', name: 'Streak Freeze', price: 150, type: 'powerup', desc: 'දවසක් නිවාඩු ගන්න!' },
  { id: 'double_xp', emoji: '⚡', name: 'Double XP', price: 80, type: 'powerup', desc: 'ලකුණු දෙගුණයක්!' },
];

const GemShop = ({ onBack }) => {
  const { gems, addGems, setAvatar, avatarId } = usePadminiStore();

  const handleBuy = (item) => {
    if (gems >= item.price) {
      addGems(-item.price);
      if (item.type === 'avatar') {
        setAvatar(item.id);
        alert(`${item.name} දැන් ඔබේ යාළුවා! ✨`);
      } else {
        alert(`${item.name} මිලදී ගත්තා! 🎉`);
      }
    } else {
      alert("ඔයාට තව මැණික් මදි දරුවෝ. තව පාඩම් කරලා මැණික් හොයමු! 💪");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala">
      <header className="p-6 bg-white border-b-4 border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition p-1"><ArrowLeft size={28} /></button>
          <h1 className="text-xl font-black text-slate-800 uppercase flex items-center gap-2">
            <ShoppingBag className="text-brand-sky" /> මැණික් කඩය
          </h1>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border-2 border-blue-100 flex items-center gap-2">
          <Gem className="text-brand-sky fill-brand-sky" size={20} />
          <span className="font-black text-brand-sky">{gems}</span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-8 pb-32">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-brand-sky to-blue-600 p-8 rounded-[2.5rem] text-white text-center shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <Sparkles className="mx-auto mb-2 opacity-80" />
                <h2 className="text-xl font-black">ඔයාගේ මැණික් වියදම් කරලා අලුත් තෑගි ගන්න!</h2>
            </div>
            <div className="absolute -right-10 -bottom-10 text-9xl opacity-10">💎</div>
        </div>

        {/* Categories */}
        <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">අලුත් යාළුවෝ (Avatars)</h3>
            <div className="grid grid-cols-2 gap-4">
                {shopItems.filter(i => i.type === 'avatar').map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleBuy(item)}
                        className="bg-white p-6 rounded-[2rem] border-2 border-b-8 border-slate-100 flex flex-col items-center gap-3 transition-all active:translate-y-1 active:border-b-0 hover:border-brand-sky group"
                    >
                        <span className="text-5xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                        <span className="font-bold text-slate-700 text-sm text-center">{item.name}</span>
                        <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                            <Gem size={12} className="text-brand-sky fill-brand-sky" />
                            <span className="text-xs font-black text-brand-sky">{item.price}</span>
                        </div>
                    </button>
                ))}
            </div>
        </section>

        <section className="space-y-4 pb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">විශේෂ බලයන් (Power-ups)</h3>
            {shopItems.filter(i => i.type === 'powerup').map(item => (
                <button
                    key={item.id}
                    onClick={() => handleBuy(item)}
                    className="w-full bg-white p-5 rounded-3xl border-2 border-b-8 border-slate-100 flex items-center gap-5 transition-all active:translate-y-1 active:border-b-0 hover:border-orange-400"
                >
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                        {item.emoji}
                    </div>
                    <div className="flex-1 text-left">
                        <h4 className="font-black text-slate-800">{item.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.desc}</p>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-blue-100">
                        <Gem size={14} className="text-brand-sky fill-brand-sky" />
                        <span className="font-black text-brand-sky">{item.price}</span>
                    </div>
                </button>
            ))}
        </section>
      </main>
    </div>
  );
};

export default GemShop;

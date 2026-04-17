import React from 'react';
import { motion } from 'framer-motion';
import { usePadminiStore } from '../store';

const avatars = [
  { id: 'owl', emoji: '🦉', name: 'නැණවත් බකමූණා' },
  { id: 'lion', emoji: '🦁', name: 'වීර සිංහයා' },
  { id: 'butterfly', emoji: '🦋', name: 'ලස්සන සමනලිය' },
  { id: 'elephant', emoji: '🐘', name: 'බලවත් අලියා' },
  { id: 'rabbit', emoji: '🐰', name: 'සුදු හාවා' },
  { id: 'bee', emoji: '🐝', name: 'කඩිසර මී මැස්සා' },
];

const AvatarPicker = ({ onDone }) => {
  const { avatarId, setAvatar } = usePadminiStore();

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[120] flex flex-col items-center justify-center p-8 font-sinhala">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black text-slate-800 mb-8 text-center"
      >
        ඔයාගේ ඉගෙනුම් යාළුවා තෝරන්න!
      </motion.h2>

      <div className="grid grid-cols-3 gap-4 mb-12">
        {avatars.map((av) => (
          <button
            key={av.id}
            onClick={() => setAvatar(av.id)}
            className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all border-b-8 active:translate-y-1
              ${avatarId === av.id
                ? 'bg-blue-100 border-blue-400 scale-110'
                : 'bg-white border-slate-100 hover:bg-slate-50 opacity-60'}`}
          >
            <span className="text-4xl">{av.emoji}</span>
            <span className="text-[8px] font-black mt-2 uppercase text-slate-400">{av.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onDone}
        className="btn-primary w-full py-5 text-xl font-black shadow-xl"
      >
        මේ මගේ යාළුවා! ✨
      </button>
    </div>
  );
};

export default AvatarPicker;

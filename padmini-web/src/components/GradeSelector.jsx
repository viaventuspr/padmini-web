import React from 'react';
import { motion } from 'framer-motion';
import { usePadminiStore } from '../store';

const grades = [
  { id: 3, name: '3 ශ්‍රේණිය', emoji: '🌱' },
  { id: 4, name: '4 ශ්‍රේණිය', emoji: '🦁' },
  { id: 5, name: '5 ශ්‍රේණිය', emoji: '🌙' },
];

const GradeSelector = ({ onDone }) => {
  const { setGrade, userGrade } = usePadminiStore();

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[120] flex flex-col items-center justify-center p-8 font-sinhala">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-8 max-w-sm w-full"
      >
        <div className="w-24 h-24 bg-[#58CC02] rounded-full flex items-center justify-center text-5xl mx-auto shadow-lg border-b-8 border-[#46A302]">👩‍🏫</div>
        <h2 className="text-3xl font-black text-slate-800">ඔයා ඉගෙන ගන්නේ කීවෙනි ශ්‍රේණියේද?</h2>

        <div className="grid gap-4">
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setGrade(g.id)}
              className={`p-6 rounded-3xl border-2 border-b-8 transition-all flex items-center gap-6 active:translate-y-1
                ${userGrade === g.id
                  ? 'bg-green-50 border-[#58CC02] text-[#46A302] scale-105'
                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 opacity-80'}`}
            >
              <span className="text-4xl">{g.emoji}</span>
              <span className="text-xl font-black">{g.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onDone}
          disabled={!userGrade}
          className="btn-primary w-full py-5 text-xl font-black shadow-xl disabled:opacity-50 disabled:grayscale"
        >
          පන්තියට යමු! 🚀
        </button>
      </motion.div>
    </div>
  );
};

export default GradeSelector;

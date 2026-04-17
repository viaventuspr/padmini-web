import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import { usePadminiStore } from '../store';

const avatars = [
  { id: 'owl', emoji: '🦉', name: 'බකමූණා' },
  { id: 'lion', emoji: '🦁', name: 'සිංහයා' },
  { id: 'butterfly', emoji: '🦋', name: 'සමනලයා' },
  { id: 'elephant', emoji: '🐘', name: 'අලියා' },
];

const LoginScreen = ({ onDone }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState('owl');

  const { setUserName, setGrade: setStoreGrade, setAvatar } = usePadminiStore();

  const handleFinish = () => {
    setUserName(name);
    setStoreGrade(grade);
    setAvatar(selectedAvatar);
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[200] flex flex-col items-center justify-center p-8 font-sinhala overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#58CC02]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-brand-sky/10 rounded-full blur-3xl animate-pulse" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm text-center space-y-8"
          >
            <div className="w-32 h-32 bg-[#58CC02] rounded-full flex items-center justify-center text-7xl mx-auto shadow-2xl border-b-8 border-[#46A302] text-white">👩‍🏫</div>
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">ආයුබෝවන්!</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">පද්මිනී පන්තියට සාදරයෙන් පිළිගන්නවා</p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-slate-100 space-y-4">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">ඔබේ නම කියන්න</label>
                <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="මෙතන ලියන්න..."
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-brand-green outline-none text-center font-black text-xl text-slate-700"
                />
            </div>
            <button
                onClick={() => name.trim() && setStep(2)} disabled={!name.trim()}
                className="btn-primary w-full py-5 text-xl font-black disabled:opacity-50"
            >
                ඉදිරියට යමු <ChevronRight />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm text-center space-y-8"
          >
            <GraduationCap size={80} className="mx-auto text-brand-sky" />
            <h2 className="text-3xl font-black text-slate-800">{name}, ඔයා ඉන්නේ කීවෙනි ශ්‍රේණියෙද?</h2>
            <div className="grid grid-cols-1 gap-4">
                {[3, 4, 5].map((g) => (
                    <button
                        key={g} onClick={() => setGrade(g)}
                        className={`p-6 rounded-[2rem] border-2 border-b-8 font-black text-2xl transition-all
                            ${grade === g ? 'bg-blue-50 border-brand-sky text-brand-sky scale-105' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                        {g} ශ්‍රේණිය
                    </button>
                ))}
            </div>
            <button
                onClick={() => grade && setStep(3)} disabled={!grade}
                className="btn-primary w-full py-5 text-xl font-black disabled:opacity-50"
            >
                තව එක පියවරයි <ChevronRight />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm text-center space-y-8"
          >
            <Sparkles size={80} className="mx-auto text-yellow-400" />
            <h2 className="text-3xl font-black text-slate-800">ඔයාගේ ඉගෙනුම් යාළුවා කවුද?</h2>
            <div className="grid grid-cols-2 gap-4">
                {avatars.map((av) => (
                    <button
                        key={av.id} onClick={() => setSelectedAvatar(av.id)}
                        className={`p-6 rounded-[2.5rem] border-2 border-b-8 transition-all flex flex-col items-center gap-2
                            ${selectedAvatar === av.id ? 'bg-green-50 border-brand-green' : 'bg-white border-slate-100 grayscale opacity-60'}`}
                    >
                        <span className="text-5xl">{av.emoji}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{av.name}</span>
                    </button>
                ))}
            </div>
            <button
                onClick={handleFinish}
                className="btn-primary w-full py-5 text-xl font-black"
            >
                පන්තියට යමු! <Sparkles size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginScreen;

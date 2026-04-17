import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import VoiceService from '../services/voice';

const GuideScreen = ({ theme, onStart }) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  useEffect(() => {
    VoiceService.onStatusChange(setIsSpeaking);
    // ස්වයංක්‍රීයව පාඩම කියවීම ආරම්භ කිරීම
    VoiceService.speak(theme.guidebook.text);
    return () => VoiceService.stop();
  }, [theme]);

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[65] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala">
      <header className="p-6 bg-white border-b-4 border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="text-brand-purple" /> පාඩම් සටහන
        </h2>
        <button
          onClick={() => isSpeaking ? VoiceService.stop() : VoiceService.speak(theme.guidebook.text)}
          className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"
        >
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </header>

      <main className="flex-1 p-8 overflow-y-auto space-y-8 pb-32 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl mb-4"
        >
          {theme.icon}
        </motion.div>

        <h1 className="text-3xl font-black text-slate-800">{theme.title}</h1>

        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm text-left leading-relaxed text-slate-600 font-bold">
          {theme.guidebook.text}
        </div>

        <div className="space-y-3">
          {theme.guidebook.points.map((point, i) => (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              key={i}
              className="flex items-center gap-3 bg-purple-50 p-4 rounded-2xl text-brand-purple font-black text-sm text-left border-2 border-purple-100"
            >
              <div className="w-6 h-6 bg-brand-purple text-white rounded-full flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              {point}
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 bg-white/90 backdrop-blur-md border-t-2 border-slate-100 max-w-md mx-auto">
        <button
          onClick={() => { VoiceService.stop(); onStart(); }}
          className="w-full bg-brand-purple border-b-8 border-purple-800 py-5 rounded-2xl text-2xl font-black text-white shadow-xl active:translate-y-2 transition-all flex items-center justify-center gap-3"
        >
          අභ්‍යාස පටන් ගමු <ArrowRight />
        </button>
      </footer>
    </div>
  );
};

export default GuideScreen;

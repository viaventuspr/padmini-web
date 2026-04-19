import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Heart, Volume2, Mic, MicOff, MessageCircle, Sparkles, Loader2, Gem, AlertCircle } from 'lucide-react';
import VoiceService from '../services/voice';
import SpeechService from '../services/speech';
import AiService from '../services/ai';
import { usePadminiStore } from '../store';

const QuizScreen = ({ questions = [], themeTitle, isHardPractice, onFinish, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [shake, setShake] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [showHeartAlert, setShowHeartAlert] = useState(false);

  const { trackMistake, recordCorrectAnswer, hearts, addGems, gems } = usePadminiStore();

  useEffect(() => {
    VoiceService.onStatusChange(setIsSpeaking);
    // ආරම්භයේදී දරුවා දිරිමත් කිරීම
    VoiceService.speak("අපි පාඩම පටන් ගනිමු දරුවෝ. අවධානයෙන් උත්තර දෙන්න.");

    return () => {
      VoiceService.onStatusChange(null);
      VoiceService.stop();
    };
  }, []);

  const q = questions[idx] || {};
  const questionText = q.question || q.q || "ප්‍රශ්නය ලබා ගත නොහැක";
  const options = q.options || q.opts || [];
  const correctIdx = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : q.ans;
  const hintText = q.hint || q.explain || "";

  const playSound = (type) => {
    const fallbackUrl = type === 'correct'
      ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
      : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';
    new Audio(fallbackUrl).play().catch(() => {});
  };

  const handleRefillHearts = () => {
    if (gems >= 20) {
      addGems(-20);
      usePadminiStore.setState({ hearts: 5 });
      setShowHeartAlert(false);
      VoiceService.speak("දැන් ඔයාට ආයෙත් ශක්තිය ලැබුණා. දිගටම කරමු!");
    } else {
      VoiceService.speak("ඔයාට මැණික් මදි දරුවෝ. තව පාඩම් කරලා මැණික් හොයමු.");
    }
  };

  const handleCheck = (forcedSelected = null) => {
    const finalSelected = forcedSelected !== null ? forcedSelected : selected;
    if (finalSelected === null || !q) return;

    const correct = finalSelected === correctIdx;
    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      setScore(s => s + 1);
      if (isHardPractice && q.id) recordCorrectAnswer(q.id);
      playSound('correct');
      VoiceService.speak(`නියමයි! ${hintText}`);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (!isHardPractice && q) trackMistake(themeTitle, q);
      playSound('wrong');

      if (hearts <= 1) {
        setShowHeartAlert(true);
        VoiceService.speak("අයියෝ දරුවෝ, ඔයාගේ ජීවිත ඉවර වෙන්න ළඟයි. අපි මැණික් භාවිතා කරලා ජීවිත ගමුද?");
      } else {
        VoiceService.speak(`වැරදියි දරුවෝ. නිවැරදි පිළිතුර ${options[correctIdx]}. ${hintText}`);
      }

      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };

  const handleContinue = () => {
    VoiceService.stop();
    setSpokenText("");
    setAiExplanation("");
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setSelected(null);
      setIsChecked(false);
      setIsCorrect(null);
    } else {
      onFinish(score + (isCorrect ? 1 : 0), questions.length);
    }
  };

  if (!questions.length || !q) return null;

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[60] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala">
      {/* Quiz Header */}
      <div className="p-6 flex items-center gap-6 bg-white border-b-2 border-slate-100">
        <button onClick={onClose} className="text-slate-400 p-1 hover:text-slate-600 transition"><X size={32} /></button>
        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(idx / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#58CC02] to-[#A5E075] origin-left"
          />
        </div>
        <div className={`flex items-center gap-1 font-black transition-colors ${hearts < 2 ? 'text-rose-600 animate-pulse' : 'text-rose-500'}`}>
            <Heart size={24} fill="currentColor" /> {hearts}
        </div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto pb-40 text-center relative">
        {/* Padmini Avatar & Interaction */}
        <div className="flex flex-col items-center mb-8 relative">
          <motion.div
            animate={isChecked ? (isCorrect ? { y: [0, -20, 0] } : { x: [-5, 5, -5, 5, 0] }) : { y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-6xl shadow-xl border-4 border-slate-50 relative"
          >
            {isChecked ? (isCorrect ? "🌟" : "😟") : "🦉"}
            {isSpeaking && <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 bg-brand-sky rounded-full -z-10" />}
          </motion.div>
        </div>

        <motion.h2 animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} className="text-2xl font-black text-slate-800 leading-snug mb-8">
          {questionText}
        </motion.h2>

        <div className="grid grid-cols-1 gap-4">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !isChecked && setSelected(i)}
              className={`p-5 rounded-[2rem] border-2 border-b-8 transition-all text-left font-bold text-lg
                ${selected === i ? 'bg-blue-50 border-brand-sky text-brand-sky -translate-y-1' : 'bg-white border-slate-100 text-slate-700'}`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 font-black text-sm ${selected === i ? 'bg-brand-sky text-white border-brand-sky shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>{['අ', 'ආ', 'ඉ', 'ඊ'][i]}</span>
                {opt}
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Heart Alert Popup */}
      <AnimatePresence>
        {showHeartAlert && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-8">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-8 rounded-[3rem] text-center space-y-6 shadow-2xl max-w-sm">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 animate-pulse">
                        <Heart size={48} fill="currentColor" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">ජීවිත ඉවරයි!</h2>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic">"දරුවෝ, මැණික් 20ක් දීලා ආයෙත් ජීවිත 5ක් ගමුද?"</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleRefillHearts} className="py-4 bg-rose-500 border-b-8 border-rose-700 rounded-2xl text-white font-black text-xl flex items-center justify-center gap-2">
                            <Gem size={20} fill="currentColor" /> මැණික් 20යි
                        </button>
                        <button onClick={onClose} className="py-2 text-slate-400 font-bold uppercase tracking-widest text-xs">පස්සේ කරමු</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <AnimatePresence>
        {isChecked ? (
          <motion.footer initial={{ y: "100%" }} animate={{ y: 0 }} className={`fixed bottom-0 left-0 right-0 p-8 pb-10 border-t-4 max-w-md mx-auto z-[70] ${isCorrect ? 'bg-[#D7FFB8] border-[#A5E075]' : 'bg-[#FFDFE0] border-[#FFB8BB]'}`}>
            <div className="flex items-start gap-5 mb-8 text-left">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md bg-white ${isCorrect ? 'text-[#46A302]' : 'text-rose-500'}`}>{isCorrect ? <Check size={40} strokeWidth={4} /> : <X size={40} strokeWidth={4} />}</div>
              <div className="flex-1">
                <h3 className={`font-black text-2xl ${isCorrect ? 'text-[#46A302]' : 'text-[#EA2B2B]'}`}>{isCorrect ? 'හරිම ලස්සනයි!' : 'නැවත බලමු!'}</h3>
                <p className="font-bold text-sm text-slate-700 mt-1">{isCorrect ? hintText : `නිවැරදි පිළිතුර: ${options[correctIdx]}`}</p>
              </div>
            </div>
            <button onClick={handleContinue} className="w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:translate-y-2 uppercase tracking-widest text-white border-b-8 bg-[#58CC02] border-[#46A302]">ඉදිරියට යමු</button>
          </motion.footer>
        ) : (
          <footer className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-white border-t-2 border-slate-100 max-w-md mx-auto z-[70]">
            <button onClick={() => handleCheck()} disabled={selected === null} className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:translate-y-2 uppercase tracking-widest border-b-8 ${selected !== null ? 'bg-[#58CC02] border-[#46A302] text-white' : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'}`}>පරීක්ෂා කරන්න</button>
          </footer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizScreen;

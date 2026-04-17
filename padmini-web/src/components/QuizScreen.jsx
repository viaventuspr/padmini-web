import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Heart, Volume2, Mic, MicOff, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
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

  const { trackMistake, recordCorrectAnswer } = usePadminiStore();

  useEffect(() => {
    VoiceService.onStatusChange(setIsSpeaking);
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

  const handleListen = async () => {
    if (isListening) return;
    setIsListening(true);
    setSpokenText("අහගෙන ඉන්නවා...");
    try {
      const transcript = await SpeechService.listen();
      setSpokenText(`ඔයා කිව්වේ: "${transcript}"`);
      const correctText = options[correctIdx].trim();
      if (transcript.includes(correctText) || correctText.includes(transcript)) {
        setSelected(correctIdx);
        setTimeout(() => handleCheck(correctIdx), 800);
      }
    } catch (err) {
      setSpokenText("මට ඇහුණේ නැහැ, ආයෙත් කියන්න.");
    } finally {
      setIsListening(false);
    }
  };

  const handleAskAI = async () => {
    if (isExplaining) return;
    setIsExplaining(true);
    try {
      const explanation = await AiService.explainToChild(
        questionText,
        options[correctIdx],
        selected !== null ? options[selected] : null
      );
      setAiExplanation(explanation);
      VoiceService.speak(explanation);
    } catch (error) {
      setAiExplanation("කණගාටුයි දරුවෝ, මට දැන් ඒක පැහැදිලි කරන්න බැහැ.");
    } finally {
      setIsExplaining(false);
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
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      VoiceService.speak(`වැරදියි දරුවෝ. නිවැරදි පිළිතුර ${options[correctIdx]}. ${hintText}`);
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
    <div className="fixed inset-0 bg-white z-[60] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala">
      <div className="p-6 flex items-center gap-6">
        <button onClick={onClose} className="text-slate-400 p-1 hover:text-slate-600 transition"><X size={32} /></button>
        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(idx / questions.length) * 100}%`, scaleY: isChecked ? [1, 1.3, 1] : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full bg-gradient-to-r from-[#58CC02] to-[#A5E075] origin-left"
          />
        </div>
        <div className="flex items-center gap-1 text-rose-500 font-black"><Heart size={24} fill="currentColor" /> 5</div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto pb-40 text-center relative">
        <div className="flex flex-col items-center mb-8 relative">
          <motion.div
            animate={isChecked ? (isCorrect ? { y: [0, -20, 0], rotate: [0, 10, -10, 0] } : { x: [-5, 5, -5, 5, 0] }) : { y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-28 h-28 bg-gradient-to-b from-green-50 to-white rounded-full flex items-center justify-center text-6xl shadow-xl border-4 border-white relative"
          >
            {isChecked ? (isCorrect ? "🐯" : "🦊") : "🦉"}
            {isSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 bg-brand-green rounded-full -z-10"
              />
            )}
          </motion.div>

          {/* Ask Padmini Button */}
          <button
            onClick={handleAskAI}
            disabled={isExplaining}
            className="absolute -right-4 top-0 bg-white p-3 rounded-full shadow-lg border-2 border-slate-100 text-brand-sky hover:scale-110 transition-all active:scale-95"
          >
            {isExplaining ? <Loader2 className="animate-spin" size={24} /> : <MessageCircle size={24} />}
          </button>

          {spokenText && <div className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold animate-pulse">{spokenText}</div>}
        </div>

        <motion.h2 animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} className="text-2xl font-black text-slate-800 leading-snug mb-8">
          {questionText}
        </motion.h2>

        {/* AI Explanation Area */}
        <AnimatePresence>
          {aiExplanation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 p-6 bg-yellow-50 rounded-[2rem] border-2 border-yellow-100 text-left relative"
            >
              <div className="flex items-center gap-2 mb-2 text-yellow-600">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">ගුරුතුමියගේ පැහැදිලි කිරීම</span>
              </div>
              <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{aiExplanation}"</p>
              <button onClick={() => setAiExplanation("")} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-3">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !isChecked && setSelected(i)}
              className={`p-4 rounded-2xl border-2 border-b-8 transition-all text-left font-bold text-lg
                ${selected === i ? 'bg-[#DDF4FF] border-[#1899D6] text-[#1899D6] -translate-y-1' : 'bg-white border-slate-200 text-slate-700'}`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 font-black text-xs ${selected === i ? 'bg-[#1899D6] text-white border-[#1899D6]' : 'bg-white border-slate-200 text-slate-300'}`}>{['අ', 'ආ', 'ඉ', 'ඊ'][i]}</span>
                {opt}
              </div>
            </button>
          ))}
        </div>

        {!isChecked && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleListen} className={`mt-8 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg border-b-8 transition-all ${isListening ? 'bg-rose-500 border-rose-700 text-white animate-pulse' : 'bg-brand-sky border-blue-600 text-white'}`}>
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </motion.button>
        )}
      </main>

      <AnimatePresence>
        {isChecked ? (
          <motion.footer initial={{ y: "100%" }} animate={{ y: 0 }} className={`fixed bottom-0 left-0 right-0 p-8 pb-10 border-t-4 max-w-md mx-auto z-50 ${isCorrect ? 'bg-[#D7FFB8] border-[#A5E075]' : 'bg-[#FFDFE0] border-[#FFB8BB]'}`}>
            <div className="flex items-start gap-5 mb-8 text-left text-slate-800">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${isCorrect ? 'bg-white text-brand-green' : 'bg-white text-red-500'}`}>{isCorrect ? <Check size={40} strokeWidth={4} /> : <X size={40} strokeWidth={4} />}</div>
              <div className="flex-1">
                <h3 className={`font-black text-2xl ${isCorrect ? 'text-[#46A302]' : 'text-[#EA2B2B]'}`}>{isCorrect ? 'හරිම ලස්සනයි!' : 'නැවත බලමු!'}</h3>
                <p className="font-bold text-sm mt-1 leading-relaxed">{isCorrect ? hintText : `නිවැරදි පිළිතුර: ${options[correctIdx]}`}</p>
              </div>
            </div>
            <button onClick={handleContinue} className="w-full py-4 rounded-2xl font-black text-xl shadow-xl transition-all active:translate-y-2 uppercase tracking-widest text-white border-b-8 bg-[#58CC02] border-[#46A302]">ඉදිරියට යමු</button>
          </motion.footer>
        ) : (
          <footer className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-white border-t-2 border-slate-100 max-w-md mx-auto z-50">
            <button onClick={() => handleCheck()} disabled={selected === null} className={`w-full py-4 rounded-2xl font-black text-xl shadow-xl transition-all active:translate-y-2 uppercase tracking-widest border-b-8 ${selected !== null ? 'bg-[#58CC02] border-[#46A302] text-white' : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'}`}>පරීක්ෂා කරන්න</button>
          </footer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizScreen;

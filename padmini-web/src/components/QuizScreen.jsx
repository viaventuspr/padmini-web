import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Heart, Volume2, Gem, BookOpen, CheckCircle2, PlayCircle, ArrowRight, Loader2 } from 'lucide-react';
import VoiceService from '../services/voice';
import SpeechService from '../services/speech';
import AiService from '../services/ai';
import { usePadminiStore } from '../store';

const QuizScreen = ({ questions = [], themeTitle, isHardPractice, isGuide, guidebook, onStart, onFinish, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHeartAlert, setShowHeartAlert] = useState(false);

  const { trackMistake, recordCorrectAnswer, hearts, addGems, gems } = usePadminiStore();

  useEffect(() => {
    VoiceService.onStatusChange(setIsSpeaking);
    VoiceService.speak("අපි පාඩම පටන් ගනිමු දරුවෝ. අවධානයෙන් උත්තර දෙන්න.");
    return () => { VoiceService.onStatusChange(null); VoiceService.stop(); };
  }, []);

  const q = questions[idx] || {};
  const questionText = q.question || q.q || "ප්‍රශ්නය ලබා ගත නොහැක";
  const options = q.options || q.opts || [];
  const correctIdx = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : q.ans;
  const hintText = q.hint || q.explain || "";

  const playSound = (type) => {
    const url = type === 'correct'
      ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
      : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';
    new Audio(url).play().catch(() => {});
  };

  const handleRefillHearts = () => {
    if (gems >= 20) {
      addGems(-20);
      usePadminiStore.setState({ hearts: 5 });
      setShowHeartAlert(false);
      VoiceService.speak("ආයෙත් ශක්තිය ලැබුණා. දිගටම කරමු!");
    } else {
      VoiceService.speak("මැණික් මදි දරුවෝ. තව පාඩම් කරලා මැණික් හොයමු.");
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
      } else {
        VoiceService.speak(`වැරදියි. නිවැරදි පිළිතුර ${options[correctIdx]}. ${hintText}`);
      }
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };

  const handleContinue = () => {
    VoiceService.stop();
    if (idx + 1 < questions.length) {
      setIdx(idx + 1); setSelected(null); setIsChecked(false); setIsCorrect(null);
    } else {
      onFinish(score, questions.length);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  // ── Guide Screen ──
  if (isGuide) {
    return (
      <div className="fixed inset-0 z-[60] bg-app flex flex-col font-sinhala overflow-y-auto pb-32">
        {/* Close */}
        <div className="p-4">
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center text-lotus-400 hover:text-lotus-700 shadow-sm transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 px-6 max-w-lg mx-auto w-full">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-lotus-500 to-lotus-400 flex items-center justify-center text-white shadow-glow-purple mb-4">
              <BookOpen size={36} />
            </motion.div>
            <h1 className="text-2xl font-black text-lotus-950">{themeTitle}</h1>
          </div>

          <div className="glass-card p-6 space-y-5">
            <p className="font-semibold text-lotus-700 leading-relaxed text-center">{guidebook?.text || "මෙම පාඩම පිළිබඳ කෙටි හැඳින්වීමක්..."}</p>
            <div className="space-y-3 pt-4 border-t border-lotus-50">
              {(guidebook?.points || ["වැදගත් කරුණු"]).map((p, i) => (
                <div key={i} className="flex gap-3 items-start bg-ocean-50 p-3.5 rounded-2xl">
                  <CheckCircle2 size={20} className="text-ocean-500 shrink-0 mt-0.5" />
                  <span className="font-semibold text-sm text-ocean-700 leading-snug">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-surface via-surface/90 to-transparent max-w-lg mx-auto z-10">
          <button onClick={() => { VoiceService.stop(); onStart && onStart(); }}
            className="w-full py-4 btn-action text-lg flex items-center justify-center gap-3">
            <PlayCircle size={22} /> අභ්‍යාස පටන් ගමු
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length || !q) return null;

  // ── Quiz Screen ──
  return (
    <div className="fixed inset-0 z-[60] bg-app flex flex-col max-w-lg mx-auto overflow-hidden font-sinhala">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-lotus-100/50">
        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-lotus-50 flex items-center justify-center text-lotus-400 hover:text-lotus-700 transition-all">
          <X size={20} />
        </button>
        {/* Progress */}
        <div className="flex-1 h-3 bg-lotus-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${((idx + (isChecked ? 1 : 0)) / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-lotus-600 to-lotus-400 rounded-full" />
        </div>
        {/* Hearts */}
        <div className={`flex items-center gap-1 font-extrabold text-sm ${hearts < 2 ? 'text-red-500 animate-pulse' : 'text-rose-400'}`}>
          <Heart size={18} className="fill-current" /> {hearts}
        </div>
        {/* Counter */}
        <span className="text-xs font-bold text-lotus-300">{idx + 1}/{questions.length}</span>
      </div>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto pb-36 relative">
        {/* Teacher Avatar */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={isChecked ? (isCorrect ? { y: [0, -15, 0] } : { x: [-4, 4, -4, 4, 0] }) : { y: [0, -4, 0] }}
            transition={{ repeat: isChecked ? 0 : Infinity, duration: 2 }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-lotus-100 to-lotus-50 flex items-center justify-center text-4xl shadow-card relative border border-lotus-100/50">
            {isChecked ? (isCorrect ? '🎉' : '🤔') : '🌸'}
            {isSpeaking && (
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 bg-lotus-300 rounded-3xl -z-10" />
            )}
          </motion.div>
        </div>

        {/* Question */}
        <motion.h2 animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          className="text-xl font-black text-lotus-950 leading-snug mb-6 text-center">
          {questionText}
        </motion.h2>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt, i) => {
            let optStyles = 'bg-white border-lotus-100 text-lotus-800 hover:shadow-card-hover';
            if (isChecked) {
              if (i === correctIdx) optStyles = 'bg-ocean-50 border-ocean-300 text-ocean-700 ring-2 ring-ocean-200';
              else if (i === selected && !isCorrect) optStyles = 'bg-red-50 border-red-200 text-red-600';
              else optStyles = 'bg-white border-slate-100 text-slate-300';
            } else if (selected === i) {
              optStyles = 'bg-lotus-50 border-lotus-400 text-lotus-700 ring-2 ring-lotus-200 shadow-glow-purple';
            }

            return (
              <motion.button key={i}
                whileTap={!isChecked ? { scale: 0.98 } : {}}
                onClick={() => !isChecked && setSelected(i)}
                disabled={isChecked}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${optStyles}`}>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 transition-all
                  ${selected === i && !isChecked ? 'bg-lotus-600 text-white' :
                    isChecked && i === correctIdx ? 'bg-ocean-500 text-white' :
                    isChecked && i === selected && !isCorrect ? 'bg-red-400 text-white' :
                    'bg-lotus-50 text-lotus-300'}`}>
                  {optionLabels[i]}
                </span>
                <span className="font-semibold text-sm flex-1">{opt}</span>
              </motion.button>
            );
          })}
        </div>
      </main>

      {/* Heart Alert */}
      <AnimatePresence>
        {showHeartAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-lotus-950/70 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-4xl text-center space-y-5 shadow-2xl max-w-sm w-full">
              <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
                <Heart size={36} className="text-red-500 fill-red-500 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-lotus-950">ජීවිත ඉවරයි!</h2>
              <p className="text-sm text-lotus-400 font-medium">මැණික් 20ක් දී ජීවිත 5ක් ගමුද?</p>
              <button onClick={handleRefillHearts}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg active:scale-[0.97] flex items-center justify-center gap-2">
                <Gem size={18} className="fill-white" /> මැණික් 20යි
              </button>
              <button onClick={onClose} className="text-lotus-300 text-xs font-bold uppercase tracking-wider">පස්සේ කරමු</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <AnimatePresence>
        {isChecked ? (
          <motion.footer initial={{ y: '100%' }} animate={{ y: 0 }}
            className={`fixed bottom-0 left-0 right-0 p-5 pb-8 max-w-lg mx-auto z-[70] border-t-2
              ${isCorrect ? 'bg-ocean-50 border-ocean-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                ${isCorrect ? 'bg-ocean-500 text-white' : 'bg-red-500 text-white'}`}>
                {isCorrect ? <Check size={24} strokeWidth={3} /> : <X size={24} strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-lg ${isCorrect ? 'text-ocean-700' : 'text-red-600'}`}>
                  {isCorrect ? 'නියමයි!' : 'වැරදියි!'}
                </h3>
                <p className="text-xs font-medium text-lotus-500 mt-0.5">
                  {isCorrect ? hintText : `නිවැරදි: ${options[correctIdx]}`}
                </p>
              </div>
            </div>
            <button onClick={handleContinue} className="w-full py-4 btn-action text-base flex items-center justify-center gap-2">
              ඉදිරියට <ArrowRight size={18} />
            </button>
          </motion.footer>
        ) : (
          <footer className="fixed bottom-0 left-0 right-0 p-5 pb-8 bg-white/90 backdrop-blur-xl border-t border-lotus-100/50 max-w-lg mx-auto z-[70]">
            <button onClick={() => handleCheck()} disabled={selected === null}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2
                ${selected !== null ? 'btn-action' : 'bg-lotus-100 text-lotus-300 cursor-not-allowed'}`}>
              පරීක්ෂා කරන්න
            </button>
          </footer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizScreen;

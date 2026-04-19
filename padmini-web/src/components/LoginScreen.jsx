import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Phone, LogIn, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { usePadminiStore } from '../store';

const avatars = [
  { id: 'owl', emoji: '🦉', name: 'බකමූණා', color: 'from-violet-400 to-purple-500' },
  { id: 'lion', emoji: '🦁', name: 'සිංහයා', color: 'from-amber-400 to-orange-500' },
  { id: 'butterfly', emoji: '🦋', name: 'සමනලයා', color: 'from-sky-400 to-cyan-500' },
  { id: 'elephant', emoji: '🐘', name: 'අලියා', color: 'from-emerald-400 to-teal-500' },
];

const grades = [
  { value: 3, label: '3 ශ්‍රේණිය', emoji: '🌱', desc: 'ආරම්භක මට්ටම' },
  { value: 4, label: '4 ශ්‍රේණිය', emoji: '🌿', desc: 'මධ්‍ය මට්ටම' },
  { value: 5, label: '5 ශ්‍රේණිය', emoji: '🌳', desc: 'ශිෂ්‍යත්ව මට්ටම' },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const LoginScreen = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState('owl');

  const { setAuthUser, setGrade: setStoreGrade, setAvatar, setUserName } = usePadminiStore();

  const goTo = (nextStep) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setError(null);
    if (!auth) { setError("Firebase සේවාව සම්බන්ධ නැත."); return; }
    setLoading(true);
    const safetyTimer = setTimeout(() => setLoading(false), 60000);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      clearTimeout(safetyTimer);
      await setAuthUser(result.user);
      if (usePadminiStore.getState().isAdmin) { onDone(); }
      else { setName(result.user.displayName || ''); goTo(2); }
    } catch (error) {
      clearTimeout(safetyTimer);
      if (error.code === 'auth/popup-closed-by-user') setError("Login ජනේලය වසා දැමුවා.");
      else if (error.code !== 'auth/cancelled-by-user') setError("ලොග් වීමට නොහැකි විය.");
    } finally { setLoading(false); }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
  };

  const handleSendOTP = async () => {
    setError(null);
    if (!phoneNumber || !auth) { setError(!auth ? "Firebase සම්බන්ධ නැත." : "අංකය ඇතුළත් කරන්න."); return; }
    setLoading(true);
    try {
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber.trim(), window.recaptchaVerifier);
      setConfirmationResult(confirmation);
    } catch (e) { setError("OTP යැවීමට නොහැක."); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setError(null); setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      await setAuthUser(result.user);
      if (usePadminiStore.getState().isAdmin) onDone();
      else goTo(1);
    } catch (e) { setError("OTP අංකය වැරදියි."); }
    finally { setLoading(false); }
  };

  const handleFinish = () => { setUserName(name); setStoreGrade(grade); setAvatar(selectedAvatar); onDone(); };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden font-sinhala">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-lotus-50 via-white to-ocean-50"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] orb-purple rounded-full"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] orb-teal rounded-full"></div>
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] orb-gold rounded-full"></div>

      <div id="recaptcha-container"></div>

      <div className="w-full max-w-sm px-6 relative z-10">
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-10">
          {[0,1,2,3].map(i => (
            <motion.div key={i} animate={{ width: i === step ? 32 : 8 }}
              className={`h-2 rounded-full transition-colors duration-500 ${i <= step ? 'bg-lotus-600' : 'bg-lotus-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {/* ── Step 0: Auth ── */}
          {step === 0 && (
            <motion.div key="s0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-8 text-center">

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-lotus-600 to-lotus-400 flex items-center justify-center text-6xl shadow-float">
                🌸
              </motion.div>

              <div>
                <h1 className="text-3xl font-black text-lotus-950 leading-tight">ආයුබෝවන්!</h1>
                <p className="text-sm text-lotus-400 font-semibold mt-2">පද්මිනී පන්තියට පිවිසෙන්න</p>
              </div>

              {error && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                  className="bg-red-50 text-red-600 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold border border-red-100">
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}

              <div className="space-y-3">
                <button onClick={handleGoogleLogin} disabled={loading}
                  className="w-full py-4 glass-card flex items-center justify-center gap-3 font-bold text-lotus-950 hover:shadow-card-hover active:scale-[0.98] transition-all">
                  {loading ? <Loader2 className="animate-spin text-lotus-600" size={20} /> :
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                  }
                  Google වලින් පිවිසෙන්න
                </button>

                <div className="flex items-center gap-4 py-2">
                  <span className="flex-1 h-px bg-lotus-100"></span>
                  <span className="text-[10px] font-bold text-lotus-300 uppercase tracking-widest">හෝ</span>
                  <span className="flex-1 h-px bg-lotus-100"></span>
                </div>

                <div className="glass-card p-5 space-y-3">
                  {!confirmationResult ? (
                    <>
                      <input type="tel" placeholder="+94 7X XXX XXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                        className="w-full p-3.5 bg-lotus-50/50 rounded-xl border border-lotus-100 outline-none text-center font-semibold text-lotus-950 focus:border-lotus-400 focus:ring-2 focus:ring-lotus-100 transition-all" />
                      <button onClick={handleSendOTP} disabled={loading}
                        className="w-full py-3 btn-action text-sm flex items-center justify-center gap-2">
                        {loading ? "යවමින්..." : <><Phone size={16} /> SMS එවන්න</>}
                      </button>
                    </>
                  ) : (
                    <>
                      <input type="text" placeholder="XXXXXX" value={otp} onChange={e => setOtp(e.target.value)}
                        className="w-full p-3.5 bg-lotus-50/50 rounded-xl border border-lotus-100 outline-none text-center font-black text-2xl tracking-[0.3em] text-lotus-700 focus:border-lotus-400 transition-all" />
                      <button onClick={handleVerifyOTP} disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-ocean-500 to-ocean-400 text-white font-bold rounded-xl shadow-glow-teal active:scale-[0.97] transition-all flex items-center justify-center gap-2">
                        {loading ? "තහවුරු කරමින්..." : <><LogIn size={16} /> තහවුරු කරන්න</>}
                      </button>
                      <button onClick={() => setConfirmationResult(null)} className="w-full text-[10px] font-bold text-lotus-400">නැවත අංකය ඇතුළත් කරන්න</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Name ── */}
          {step === 1 && (
            <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-8 text-center">
              <div className="text-6xl">👋</div>
              <div>
                <h1 className="text-3xl font-black text-lotus-950">ඔයාගේ නම?</h1>
                <p className="text-sm text-lotus-400 font-semibold mt-2">ගුරුතුමියට ඔයාව හඳුන්වන්න</p>
              </div>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="නම ලියන්න..."
                className="w-full p-5 glass-card text-center font-bold text-xl text-lotus-950 outline-none focus:shadow-glow-purple transition-all placeholder:text-lotus-200" />
              <button onClick={() => name.trim() && goTo(2)} disabled={!name.trim()}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${name.trim() ? 'btn-action' : 'bg-lotus-100 text-lotus-300 cursor-not-allowed'}`}>
                ඊළඟ පියවර <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Grade ── */}
          {step === 2 && (
            <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-8 text-center">
              <div className="text-6xl">📚</div>
              <div>
                <h1 className="text-3xl font-black text-lotus-950">ශ්‍රේණිය තෝරන්න</h1>
                <p className="text-sm text-lotus-400 font-semibold mt-2">ඔබට ගැළපෙන මට්ටම තෝරන්න</p>
              </div>
              <div className="grid gap-3">
                {grades.map(g => (
                  <motion.button key={g.value} whileTap={{ scale: 0.97 }}
                    onClick={() => { setGrade(g.value); goTo(3); }}
                    className={`p-5 glass-card flex items-center gap-4 text-left transition-all
                      ${grade === g.value ? 'ring-2 ring-lotus-500 shadow-glow-purple' : 'hover:shadow-card-hover'}`}>
                    <span className="text-3xl">{g.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-lotus-950 text-lg">{g.label}</p>
                      <p className="text-xs text-lotus-400 font-medium">{g.desc}</p>
                    </div>
                    <ChevronRight size={20} className="text-lotus-300" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Avatar ── */}
          {step === 3 && (
            <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-8 text-center">
              <div className="text-6xl">✨</div>
              <div>
                <h1 className="text-3xl font-black text-lotus-950">යාළුවෙක් තෝරමු</h1>
                <p className="text-sm text-lotus-400 font-semibold mt-2">ඔයා සමඟ ඉගෙනුම් ගමනේ යන සහචරයා</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {avatars.map(av => (
                  <motion.button key={av.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`relative p-6 rounded-4xl flex flex-col items-center gap-3 transition-all duration-300
                      ${selectedAvatar === av.id
                        ? `bg-gradient-to-br ${av.color} text-white shadow-float scale-105`
                        : 'glass-card text-lotus-950 opacity-70'}`}>
                    <span className="text-5xl drop-shadow-md">{av.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wide">{av.name}</span>
                    {selectedAvatar === av.id && (
                      <motion.div layoutId="avatar-check" className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              <button onClick={handleFinish} className="w-full py-4 btn-action text-lg flex items-center justify-center gap-2">
                පන්තියට යමු! <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginScreen;

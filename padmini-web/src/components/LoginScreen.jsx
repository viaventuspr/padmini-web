import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Sparkles, GraduationCap, Phone, LogIn, Mail } from 'lucide-react';
import { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { usePadminiStore } from '../store';

const avatars = [
  { id: 'owl', emoji: '🦉', name: 'බකමූණා' },
  { id: 'lion', emoji: '🦁', name: 'සිංහයා' },
  { id: 'butterfly', emoji: '🦋', name: 'සමනලයා' },
  { id: 'elephant', emoji: '🐘', name: 'අලියා' },
];

const LoginScreen = ({ onDone }) => {
  const [step, setStep] = useState(0); // 0: Auth Method, 1: Name, 2: Grade, 3: Avatar
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState('owl');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUserName, setGrade: setStoreGrade, setAvatar } = usePadminiStore();

  // --- Google Login ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setName(result.user.displayName || '');
      setStep(2); // කෙලින්ම ශ්‍රේණිය තේරීමට යයි
    } catch (error) {
      alert("Google Login අසාර්ථක විය.");
    } finally {
      setLoading(false);
    }
  };

  // --- Phone Login (OTP) ---
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    try {
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      alert("රහස් අංකය (OTP) SMS මගින් එවා ඇත.");
    } catch (error) {
      alert("දුරකථන අංකය වැරදියි හෝ ගැටලුවක් පවතී.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setStep(1); // නම ඇතුළත් කිරීමට යයි
    } catch (error) {
      alert("OTP අංකය වැරදියි.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setUserName(name);
    setStoreGrade(grade);
    setAvatar(selectedAvatar);
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-[#FFFEF7] z-[200] flex flex-col items-center justify-center p-8 font-sinhala overflow-hidden">
      <div id="recaptcha-container"></div>

      <AnimatePresence mode="wait">
        {/* Step 0: Auth Method Selection */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm text-center space-y-8">
            <div className="w-32 h-32 bg-[#58CC02] rounded-full flex items-center justify-center text-7xl mx-auto shadow-2xl border-b-8 border-[#46A302] text-white">👩‍🏫</div>
            <h1 className="text-3xl font-black text-slate-800">පද්මිනී පන්තියට ලොග් වෙමු</h1>

            <div className="space-y-4">
                <button onClick={handleGoogleLogin} className="w-full py-4 bg-white border-2 border-b-8 border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-black text-slate-600 hover:bg-slate-50 transition-all">
                    <Mail className="text-rose-500" /> Google ගිණුමෙන්
                </button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#FFFEF7] px-2 text-slate-400 font-bold">එසේත් නැතිනම්</span></div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 space-y-4 shadow-sm">
                    {!confirmationResult ? (
                        <>
                            <input
                                type="tel" placeholder="+94 7X XXX XXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none text-center font-bold"
                            />
                            <button onClick={handleSendOTP} disabled={loading} className="w-full py-3 bg-brand-sky text-white rounded-xl font-black shadow-md border-b-4 border-blue-600">
                                SMS එවන්න <Phone size={18} className="inline ml-2" />
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text" placeholder="OTP අංකය..." value={otp} onChange={e => setOtp(e.target.value)}
                                className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 outline-none text-center font-black tracking-widest text-2xl"
                            />
                            <button onClick={handleVerifyOTP} disabled={loading} className="w-full py-3 bg-green-500 text-white rounded-xl font-black shadow-md border-b-4 border-green-700">
                                තහවුරු කරන්න <LogIn size={18} className="inline ml-2" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            <button onClick={() => setStep(1)} className="text-slate-400 font-bold text-xs underline mt-4">ලොග් නොවී ඇතුළු වන්න</button>
          </motion.div>
        )}

        {/* Step 1: Name Entry */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm text-center space-y-8">
            <h1 className="text-4xl font-black text-slate-800">ඔයාගේ නම මොකක්ද?</h1>
            <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="නම මෙතන ලියන්න..."
                className="w-full p-6 bg-white rounded-[2.5rem] border-4 border-slate-100 focus:border-brand-green outline-none text-center font-black text-2xl shadow-xl"
            />
            <button onClick={() => name.trim() && setStep(2)} className="btn-primary w-full py-5 text-xl font-black">ඉදිරියට යමු <ChevronRight /></button>
          </motion.div>
        )}

        {/* Step 2: Grade Selection */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm text-center space-y-8">
            <GraduationCap size={80} className="mx-auto text-brand-sky animate-bounce" />
            <h2 className="text-3xl font-black text-slate-800">{name}, ශ්‍රේණිය තෝරන්න</h2>
            <div className="grid grid-cols-1 gap-4">
                {[3, 4, 5].map((g) => (
                    <button key={g} onClick={() => setGrade(g)} className={`p-6 rounded-[2.5rem] border-4 border-b-8 font-black text-3xl transition-all ${grade === g ? 'bg-blue-50 border-brand-sky text-brand-sky scale-105' : 'bg-white border-slate-100 text-slate-400'}`}>
                        {g} ශ්‍රේණිය
                    </button>
                ))}
            </div>
            <button onClick={() => grade && setStep(3)} disabled={!grade} className="btn-primary w-full py-5 text-xl font-black">අවසාන පියවර <ChevronRight /></button>
          </motion.div>
        )}

        {/* Step 3: Avatar Selection */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm text-center space-y-8">
            <Sparkles size={80} className="mx-auto text-yellow-400" />
            <h2 className="text-3xl font-black text-slate-800">යාළුවෙක් තෝරාගමු</h2>
            <div className="grid grid-cols-2 gap-4">
                {avatars.map((av) => (
                    <button key={av.id} onClick={() => setSelectedAvatar(av.id)} className={`p-6 rounded-[2.5rem] border-4 border-b-8 transition-all flex flex-col items-center gap-2 ${selectedAvatar === av.id ? 'bg-green-50 border-brand-green' : 'bg-white border-slate-100 grayscale opacity-60'}`}>
                        <span className="text-5xl">{av.emoji}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400">{av.name}</span>
                    </button>
                ))}
            </div>
            <button onClick={handleFinish} className="btn-primary w-full py-5 text-xl font-black">පන්තිය පටන් ගමු! 🚀</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginScreen;

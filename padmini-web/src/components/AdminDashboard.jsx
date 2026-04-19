import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Trash2, Send, ArrowLeft, Loader2, Sparkles, AlertCircle, Edit3, Save, LayoutGrid, Mic, Square, Play, UploadCloud, Volume2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import AiService from '../services/ai';
import ApiService from '../services/api';
import VoiceService from '../services/voice';
import { VoiceManager } from '../services/VoiceManager';

// PDF Worker Initialization
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const AdminDashboard = ({ onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [editingIdx, setEditingIdx] = useState(null);
  const [adminTab, setAdminTab] = useState('lessons'); // 'lessons' | 'voice'

  const fileInputRef = useRef(null);

  // --- Voice Studio Component ---
  const VoiceRecorder = ({ textKey }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [localRecorder, setLocalRecorder] = useState(null);
    const [currentUrl, setCurrentUrl] = useState(VoiceService.localVoiceMap[textKey]);
    const [isUploading, setIsUploading] = useState(false);
    const vFileRef = useRef(null);

    const startRec = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setIsUploading(true);
          try {
            const url = await VoiceManager.uploadAndMapVoice(textKey, blob);
            setCurrentUrl(url);
          } catch(e) { alert("හඬ අප්ලෝඩ් කිරීම අසාර්ථක විය: " + e.message); }
          setIsUploading(false);
        };
        recorder.start();
        setLocalRecorder(recorder);
        setIsRecording(true);
      } catch(e) { alert("මයික්‍රොෆෝනය සඳහා අවසර ලබාගැනීමට නොහැක!"); }
    };

    const stopRec = () => {
      if(localRecorder) {
        localRecorder.stop();
        setIsRecording(false);
        localRecorder.stream.getTracks().forEach(t => t.stop());
      }
    };

    const uploadAudioFile = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setIsUploading(true);
      try {
        const url = await VoiceManager.uploadAndMapVoice(textKey, file);
        setCurrentUrl(url);
      } catch(err) { alert("ෆයිල් එක අප්ලෝඩ් කිරීම අසාර්ථකයි."); }
      setIsUploading(false);
    };

    const playVoice = () => {
       const a = new Audio(currentUrl);
       a.play().catch(() => alert("හඬ වාදනයට නොහැක."));
    };

    return (
      <div className="flex flex-col gap-3 p-5 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm transition-all hover:border-brand-sky">
        <p className="font-black text-slate-700 leading-snug">{textKey}</p>
        <div className="flex items-center gap-3">
          <button onClick={isRecording ? stopRec : startRec} className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-[#58CC02] hover:scale-110'}`}>
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
          </button>
          <button onClick={() => vFileRef.current.click()} disabled={isUploading || isRecording} className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-sky transition-all hover:bg-blue-50 hover:border-blue-200">
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
          </button>
          <input type="file" ref={vFileRef} onChange={uploadAudioFile} accept="audio/*" className="hidden" />
          
          {currentUrl && !currentUrl.startsWith('/') && (
             <span className="text-[9px] bg-[#D7FFB8] text-[#46A302] px-3 py-1 rounded-full font-black uppercase flex items-center gap-1">
                <CheckCircle2 size={12}/> සෑදුවා
             </span>
          )}
          <button onClick={playVoice} className="ml-auto w-12 h-12 rounded-full flex items-center justify-center text-brand-sky bg-blue-50 transition-all hover:scale-110 hover:bg-blue-100">
             <Volume2 size={24} />
          </button>
        </div>
      </div>
    );
  };
  // --------------------------------

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(" ") + "\n";
    }
    return fullText;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorInfo("");
    setIsProcessing(true);
    setGeneratedQuestions([]); // Reset previous content

    try {
      if (file.type !== "application/pdf") {
        throw new Error("කරුණාකර PDF ගොනුවක් පමණක් තෝරන්න.");
      }

      const text = await extractTextFromPDF(file);
      
      if (!text || text.trim().length < 20) {
        throw new Error("මෙම PDF එකෙන් අකුරු කියවිය නොහැක. මෙය පින්තූරයක් ලෙස ඇති PDF එකක් විය හැකියි.");
      }

      const questions = await AiService.generateQuestionsFromText(text);

      if (!questions || questions.length === 0) {
        throw new Error("මෙම පත්‍රිකාවෙන් ප්‍රශ්න සෑදීමට AI එකට නොහැකි විය. කරුණාකර වෙනත් එකක් උත්සාහ කරන්න.");
      }

      const formatted = questions.map((q, idx) => ({
        id: Date.now() + idx,
        q: q.q || q.question || "ප්‍රශ්නයක් නැත",
        opts: q.opts || q.options || ["A", "B", "C", "D"],
        ans: q.ans !== undefined ? q.ans : (q.correctAnswerIndex || 0),
        explain: q.explain || q.hint || "විස්තරයක් නැත",
        emoji: q.emoji || "🌿"
      }));

      setGeneratedQuestions(formatted);
      setLessonTitle(questions[0]?.topic || file.name.replace(".pdf", ""));
    } catch (error) {
      console.error("Upload Error:", error);
      setErrorInfo(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const lessonData = {
        id: Date.now(),
        title: lessonTitle,
        icon: generatedQuestions[0]?.emoji || "📚",
        questions: generatedQuestions,
        grade: "3-5",
        guidebook: {
          text: "මෙම පාඩම AI තාක්ෂණය මගින් ස්වයංක්‍රීයව සකසා ඇත.",
          points: ["AI පාඩම", "නව දැනුම", "ස්වයංක්‍රීය ඇගයීම"]
        }
      };
      // Firestore වෙත යැවීම
      await ApiService.publishLesson(selectedUnit, lessonData);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onBack(); }, 2000);
    } catch (e) {
      setErrorInfo("Publish කිරීමට නොහැකි විය.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala">
      <header className="p-6 bg-white border-b-4 border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">ගුරු පාලක පුවරුව</h1>
        </div>
        <div className="w-10 h-10 bg-[#FFDFE0] rounded-xl flex items-center justify-center text-[#EA2B2B]">
            <Edit3 size={20} />
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-6 pb-40">
        
        {/* Admin Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-full mb-2">
           <button onClick={() => setAdminTab('lessons')} className={`flex-1 py-3.5 font-black text-sm rounded-full transition-all ${adminTab==='lessons' ? 'bg-white shadow-sm text-brand-sky' : 'text-slate-400'}`}>පාඩම් සැකසුම්</button>
           <button onClick={() => setAdminTab('voice')} className={`flex-1 py-3.5 font-black text-sm rounded-full transition-all ${adminTab==='voice' ? 'bg-white shadow-sm text-[#46A302]' : 'text-slate-400'}`}>හඬ ස්ටුඩියෝව</button>
        </div>

        {adminTab === 'voice' ? (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-[#D7FFB8] p-8 rounded-[2.5rem] border-2 border-[#A5E075] text-center mb-6 relative overflow-hidden">
                 <Mic size={48} className="mx-auto text-[#46A302] mb-3 animate-pulse relative z-10" />
                 <h2 className="text-xl font-black text-slate-800 relative z-10">ටීචර්ගේ සජීවී කටහඬ</h2>
                 <p className="text-xs font-bold text-[#46A302] mt-2 relative z-10 leading-relaxed">AI කටහඬ වෙනුවට ඔබේ ආදරණීය කටහඬ මින් රෙකෝඩ් කර ආදේශ කරන්න!</p>
                 <Sparkles size={100} className="absolute -bottom-8 -right-8 text-white opacity-40 rotate-12" />
              </div>
              
              <div className="space-y-4">
                 {Object.keys(VoiceService.localVoiceMap).map(key => (
                    <VoiceRecorder key={key} textKey={key} />
                 ))}
              </div>
           </motion.div>
        ) : (
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <section className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">පාඩම ඇතුළත් කළ යුතු ඒකකය</h3>
            <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(u => (
                    <button
                        key={u} onClick={() => setSelectedUnit(u)}
                        className={`py-3 rounded-2xl font-black transition-all border-2
                            ${selectedUnit === u ? 'bg-brand-sky border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                        {u}
                    </button>
                ))}
            </div>
        </section>

            {errorInfo && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500">
                <AlertCircle size={20} />
                <p className="text-xs font-bold leading-tight">{errorInfo}</p>
              </motion.div>
            )}

            {!generatedQuestions.length ? (
              <motion.div
                whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.95 }}
                onClick={() => !isProcessing && fileInputRef.current.click()}
                className={`bg-white p-12 rounded-[3rem] border-4 border-dashed text-center space-y-4 cursor-pointer transition-all group
                  ${isProcessing ? 'border-brand-sky opacity-50 cursor-wait' : 'border-slate-200 hover:border-brand-green'}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-brand-green group-hover:rotate-12 transition-transform">
                  {isProcessing ? <Loader2 className="animate-spin" size={48} /> : <Upload size={48} />}
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800">{isProcessing ? "ප්‍රශ්න සකසමින්..." : "PDF එකක් එක් කරන්න"}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI තාක්ෂණයෙන් තත්පර කීපයකින් පාඩම හැදේ</p>
                </div>
              </motion.div>
            ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                <input
                    type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                    className="w-full font-black text-2xl text-slate-800 outline-none border-b-4 border-transparent focus:border-brand-sky transition-all"
                    placeholder="පාඩමේ නම..."
                />
            </div>

            {generatedQuestions.map((q, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-100 relative group">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">{q.emoji}</span>
                    <button onClick={() => setGeneratedQuestions(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                </div>

                {editingIdx === i ? (
                    <textarea
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-2 border-brand-sky"
                        value={q.q} onChange={e => {
                            const newQs = [...generatedQuestions];
                            newQs[i].q = e.target.value;
                            setGeneratedQuestions(newQs);
                        }}
                    />
                ) : (
                    <p className="font-black text-slate-800 text-lg leading-snug mb-4">{q.q}</p>
                )}

                <div className="grid gap-2 mb-4">
                  {q.opts.map((opt, oi) => (
                    <div key={oi} className={`p-4 rounded-2xl text-sm font-bold border-2 ${oi === q.ans ? 'bg-green-50 border-brand-green text-green-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {opt}
                    </div>
                  ))}
                </div>

                <button
                    onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                    className="w-full py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                    {editingIdx === i ? <><Save size={14}/> සුරකින්න</> : <><Edit3 size={14}/> ප්‍රශ්නය වෙනස් කරන්න</>}
                </button>
              </motion.div>
            ))}
          </div>
        )}
        </motion.div>
        )}
      </main>

      {adminTab === 'lessons' && generatedQuestions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t-4 border-slate-50 max-w-md mx-auto z-[110] flex gap-3">
            <button
                onClick={handlePublish} disabled={isPublishing}
                className="flex-1 py-5 bg-brand-green border-b-8 border-[#46A302] rounded-3xl text-white font-black text-xl shadow-xl flex items-center justify-center gap-3 active:translate-y-2 active:border-b-0 transition-all uppercase tracking-widest"
            >
                {isPublishing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {isPublishing ? "සකසමින්..." : "සජීවී කරන්න"}
            </button>
        </div>
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-white p-10 rounded-[3rem] text-center space-y-4 shadow-2xl">
                <div className="w-20 h-20 bg-green-100 text-brand-green rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">සාර්ථකයි!</h2>
                <p className="font-bold text-slate-500 italic">"පද්මිනී පන්තියට අලුත් පාඩම සාර්ථකව එකතු වුණා දරුවෝ."</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

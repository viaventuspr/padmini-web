import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Trash2, Send, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import AiService from '../services/ai';
import ApiService from '../services/api';

// බාහිර ලින්ක් වෙනුවට ලෝකල් වර්කර් එක භාවිතා කිරීම (Fixed 404 Error)
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const AdminDashboard = ({ onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const fileInputRef = useRef(null);

  const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(" ") + "\n";
        }
        return fullText;
    } catch (e) {
        console.error("PDF Read Error:", e);
        throw new Error("PDF එක කියවීමට නොහැකි විය. කරුණාකර වෙනත් PDF එකක් උත්සාහ කරන්න.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorInfo("");
    setIsProcessing(true);
    try {
      // 1. PDF එකෙන් අකුරු ලබා ගැනීම
      const text = await extractTextFromPDF(file);

      // 2. AI මගින් ප්‍රශ්න සෑදීම
      const questions = await AiService.generateQuestionsFromText(text);

      if (!questions || questions.length === 0) {
          throw new Error("AI එකට ප්‍රශ්න සෑදීමට නොහැකි විය. ඔබේ Gemini API Key එක නිවැරදිදැයි බලන්න.");
      }

      const formattedQuestions = questions.map((q, idx) => ({
        id: Date.now() + idx,
        q: q.q || q.question,
        opts: q.opts || q.options,
        ans: q.ans !== undefined ? q.ans : q.correctAnswerIndex,
        explain: q.explain || q.hint,
        emoji: q.emoji || "📚",
        topic: q.topic || "අලුත් පාඩම"
      }));

      setGeneratedQuestions(formattedQuestions);
      setLessonTitle(formattedQuestions[0].topic);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setErrorInfo(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (generatedQuestions.length === 0) return;
    setIsPublishing(true);
    try {
      const newLesson = {
        title: lessonTitle,
        icon: generatedQuestions[0]?.emoji || "📚",
        questions: generatedQuestions
      };
      await ApiService.publishLesson(newLesson);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onBack(); }, 2000);
    } catch (error) {
      setErrorInfo("Publish කිරීමට නොහැකි විය. Cloud සම්බන්ධතාවය පරීක්ෂා කරන්න.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[100] flex flex-col max-w-md mx-auto overflow-hidden font-sinhala">
      <header className="p-6 bg-white border-b-4 border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 p-1"><ArrowLeft size={28} /></button>
        <h1 className="text-xl font-black text-slate-800 uppercase">ගුරු පුවරුව</h1>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-6 pb-32">
        {errorInfo && (
            <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-600 animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{errorInfo}</p>
            </div>
        )}

        {!generatedQuestions.length ? (
          <section
            onClick={() => fileInputRef.current.click()}
            className="bg-white p-12 rounded-[3rem] border-4 border-dashed border-slate-200 text-center space-y-4 cursor-pointer hover:border-brand-green transition-all group shadow-sm"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-brand-green group-hover:scale-110 transition-transform">
              {isProcessing ? <Loader2 className="animate-spin" size={48} /> : <Upload size={48} />}
            </div>
            <h2 className="text-xl font-black text-slate-800">{isProcessing ? "ප්‍රශ්න හදමින්..." : "PDF එකක් තෝරන්න"}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">මම තත්පර කිහිපයකින් ප්‍රශ්නාවලිය සාදා දෙන්නම්</p>
          </section>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">පාඩමේ මාතෘකාව</label>
                <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="w-full font-black text-2xl text-slate-800 outline-none focus:text-brand-green" />
            </div>

            {generatedQuestions.map((q, i) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-100 relative">
                <button onClick={() => setGeneratedQuestions(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-6 right-6 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                <div className="text-3xl mb-4">{q.emoji}</div>
                <p className="font-black text-slate-800 text-lg mb-4 leading-snug">{q.q}</p>
                <div className="grid gap-2">
                  {q.opts.map((opt, oi) => (
                    <div key={oi} className={`p-4 rounded-2xl text-sm font-bold border-2 ${oi === q.ans ? 'bg-green-50 border-brand-green text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {['අ', 'ආ', 'ඉ', 'ඊ'][oi]}. {opt}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {generatedQuestions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t-4 border-slate-50 max-w-md mx-auto z-[110]">
            <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full py-5 bg-brand-green border-b-8 border-[#46A302] rounded-2xl text-white font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:translate-y-2 active:border-b-0 transition-all uppercase tracking-widest"
            >
                {isPublishing ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                {isPublishing ? "සකසමින්..." : "App එකට දාන්න"}
            </button>
        </div>
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150] bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-center shadow-2xl">
            <Sparkles className="text-yellow-400 mx-auto mb-2" size={32} />
            <p>පාඩම සාර්ථකව ඇතුළත් කළා!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

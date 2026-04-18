import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Trash2, Send, ArrowLeft, Loader2, Sparkles, AlertCircle, Edit3, Save, LayoutGrid } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import AiService from '../services/ai';
import ApiService from '../services/api';

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

  const fileInputRef = useRef(null);

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
    try {
      const text = await extractTextFromPDF(file);
      const questions = await AiService.generateQuestionsFromText(text);

      if (!questions) throw new Error("AI එකට ප්‍රශ්න සෑදීමට නොහැකි විය.");

      const formatted = questions.map((q, idx) => ({
        id: Date.now() + idx,
        q: q.q || q.question,
        opts: q.opts || q.options,
        ans: q.ans !== undefined ? q.ans : q.correctAnswerIndex,
        explain: q.explain || q.hint,
        emoji: q.emoji || "🌿"
      }));

      setGeneratedQuestions(formatted);
      setLessonTitle(questions[0]?.topic || "අලුත් පාඩම");
    } catch (error) {
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
        grade: "3-5"
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
        <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
            <LayoutGrid size={20} />
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto space-y-6 pb-40">
        {/* Unit Selector */}
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

        {!generatedQuestions.length ? (
          <motion.div
            whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current.click()}
            className="bg-white p-12 rounded-[3rem] border-4 border-dashed border-slate-200 text-center space-y-4 cursor-pointer hover:border-brand-green transition-all group"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" className="hidden" />
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-brand-green group-hover:rotate-12 transition-transform">
              {isProcessing ? <Loader2 className="animate-spin" size={48} /> : <Upload size={48} />}
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800">{isProcessing ? "ප්‍රශ්න සකසමින්..." : "PDF එකක් එක් කරන්න"}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI තාක්ෂණයෙන් තත්පර 10කින් පාඩම හැදේ</p>
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
      </main>

      {generatedQuestions.length > 0 && (
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

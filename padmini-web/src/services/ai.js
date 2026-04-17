import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// පද්මිනී AI - ලොව නවීනතම Gemini 2.0 Flash තාක්ෂණය භාවිතා කරයි
const SYSTEM_PROMPT = `As Padmini Teacher (Sri Lankan Primary), generate 5 MCQs from text in Sinhala JSON. Output ONLY JSON.
Structure: [{"q": "text", "opts": ["A", "B", "C", "D"], "ans": index, "explain": "short", "emoji": "one", "topic": "name"}]`;

const AiService = {
  generateQuestionsFromText: async (lessonText) => {
    if (!genAI) throw new Error("Gemini API Key missing.");

    try {
      // ලොව වේගවත්ම සහ නවීනතම Gemini 1.5 Flash භාවිතා කරයි (දැනට පවතින ස්ථාවරම සංස්කරණය)
      // 2.0 සඳහා "gemini-2.0-flash-exp" භාවිතා කළ හැකි නමුත් එය තවමත් පර්යේෂණාත්මක මට්ටමේ පවතී.
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nText: ${lessonText.substring(0, 4000)}`);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback: 404 දෝෂයක් ආවොත් ස්වයංක්‍රීයව පවතින වෙනත් model එකක් භාවිතා කරයි
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nText: ${lessonText.substring(0, 2000)}`);
      const text = (await result.response).text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }
  },

  explainToChild: async (question, correctAnswer, studentAnswer = null) => {
    if (!genAI) return "නිවැරදි පිළිතුර තමයි " + correctAnswer;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Padmini Teacher, briefly explain in 1 simple Sinhala sentence why "${correctAnswer}" is correct for "${question}". Keep it very kind.`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return "ඔයා තෝරපු පිළිතුරට වඩා " + correctAnswer + " කියන පිළිතුර ගොඩක් ගැලපෙනවා දරුවෝ.";
    }
  }
};

export default AiService;

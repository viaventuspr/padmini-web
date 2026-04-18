import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// අලුත්ම SDK අනුවාදය සමඟ සම්බන්ධතාවය තහවුරු කිරීම
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const SYSTEM_PROMPT = `As Padmini Teacher (Sri Lankan Primary), generate 5 MCQs from text in Sinhala JSON. Output ONLY JSON array.
Structure: [{"q": "text", "opts": ["A", "B", "C", "D"], "ans": index, "explain": "short", "emoji": "one", "topic": "name"}]`;

const AiService = {
  generateQuestionsFromText: async (lessonText) => {
    if (!genAI) throw new Error("Gemini API Key එක සොයාගත නොහැක.");

    // උත්සාහ කළ යුතු මාදිලි (Stable Models Only)
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const name of modelNames) {
      try {
        console.log(`🤖 AI සම්බන්ධ වෙමින්: ${name}...`);
        const model = genAI.getGenerativeModel({ model: name });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nText: ${lessonText.substring(0, 4000)}` }] }],
          generationConfig: { temperature: 0.4, topP: 0.8, topK: 40 }
        });

        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          console.log(`✅ සාර්ථකයි! භාවිතා කළේ: ${name}`);
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.warn(`${name} අසාර්ථක විය:`, error.message);
        lastError = error;
        continue;
      }
    }

    throw new Error(`AI සම්බන්ධතාවය අසාර්ථකයි. (කරුණාකර අන්තර්ජාලය සහ API Key පරීක්ෂා කරන්න). ${lastError?.message}`);
  },

  explainToChild: async (question, correctAnswer, studentAnswer = null) => {
    if (!genAI) return "නිවැරදි පිළිතුර තමයි " + correctAnswer;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Padmini Teacher, explain in 1 Sinhala sentence why "${correctAnswer}" is correct for "${question}". Be very kind.`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return "ඔයා තෝරපු පිළිතුරට වඩා " + correctAnswer + " කියන පිළිතුර ගොඩක් ගැලපෙනවා දරුවෝ.";
    }
  }
};

export default AiService;

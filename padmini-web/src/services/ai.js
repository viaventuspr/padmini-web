import { GoogleGenerativeAI } from "@google/generative-ai";

// පද්මිනී පරම AI සේවාව (Gemini 1.5 Flash - Speed Optimized)
const AiService = {
  getAPIKey: () => {
    return import.meta.env.VITE_GEMINI_API_KEY;
  },

  generateQuestionsFromText: async (lessonText) => {
    const key = AiService.getAPIKey();
    if (!key) throw new Error("Security Alert: AI Key එක සොයාගත නොහැක.");

    try {
      const genAI = new GoogleGenerativeAI(key);
      // Gemini 1.5 Flash භාවිතා කරයි (දැනට පවතින වේගවත්ම සහ නිවැරදිම මාදිලිය)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const SYSTEM_PROMPT = `As Padmini Teacher (Sri Lankan Primary), generate 5 MCQs from text in Sinhala JSON. Output ONLY JSON array.
      Structure: [{"q": "text", "opts": ["A", "B", "C", "D"], "ans": index, "explain": "short", "emoji": "one", "topic": "name"}]`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nText: ${lessonText.substring(0, 4000)}` }] }],
        generationConfig: { temperature: 0.4, topP: 0.8, topK: 40 }
      });

      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("AI Sync Error:", error.message);
      // Fallback logic
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const res = await model.generateContent(`${SYSTEM_PROMPT}\n\nText: ${lessonText.substring(0, 2000)}`);
      const match = res.response.text().match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    }
  },

  explainToChild: async (question, correctAnswer) => {
    const key = AiService.getAPIKey();
    if (!key) return "නිවැරදි පිළිතුර: " + correctAnswer;

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Padmini Teacher, explain in 1 simple Sinhala sentence why "${correctAnswer}" is correct for "${question}". Be kind.`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return `හරිම ලස්සනයි! නිවැරදි පිළිතුර වෙන්නේ ${correctAnswer}.`;
    }
  }
};

export default AiService;

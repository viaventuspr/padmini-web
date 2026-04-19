import { GoogleGenerativeAI } from "@google/generative-ai";

// පද්මිනී පරම AI සේවාව (Gemini 1.5 Flash - Speed Optimized)
const AiService = {
  getAPIKey: () => {
    return import.meta.env.VITE_GEMINI_API_KEY;
  },

  generateQuestionsFromText: async (lessonText) => {
    const key = AiService.getAPIKey();
    if (!key) throw new Error("Security Alert: AI Key එක සොයාගත නොහැක.");

    if (!lessonText || lessonText.trim().length < 10) {
      throw new Error("PDF එකෙන් ප්‍රමාණවත් අකුරු ප්‍රමාණයක් කියවිය නොහැක. කරුණාකර වෙනත් PDF එකක් උත්සාහ කරන්න.");
    }

    try {
      const genAI = new GoogleGenerativeAI(key);
      // Gemini 2.0 Flash - Using Official JSON Mode
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const SYSTEM_PROMPT = `As Padmini Teacher (Sri Lankan Primary), generate 5 MCQs from text in Sinhala.
      JSON Schema required:
      [{"q": "ප්‍රශ්නය", "opts": ["පිළිතුර 1", "2", "3", "4"], "ans": 0, "explain": "විස්තරය", "emoji": "🌿", "topic": "මාතෘකාව"}]
      Return ONLY the JSON array.`;

      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nText to analyze: ${lessonText.substring(0, 8000)}`);
      const response = await result.response;
      const text = response.text().trim();
      
      // Attempt to parse directly since we used responseMimeType
      try {
        return JSON.parse(text);
      } catch (innerError) {
        // Fallback to regex if JSON mode fails for some reason
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      }
    } catch (error) {
      console.error("AI Generation Failed:", error);
      throw new Error("AI එකට පාඩම සැකසීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
    }
  },

  explainToChild: async (question, correctAnswer) => {
    const key = AiService.getAPIKey();
    if (!key) return "නිවැරදි පිළිතුර: " + correctAnswer;

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Padmini Teacher, explain in 1 simple Sinhala sentence why "${correctAnswer}" is correct for "${question}". Be kind.`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return `හරිම ලස්සනයි! නිවැරදි පිළිතුර වෙන්නේ ${correctAnswer}.`;
    }
  }
};

export default AiService;

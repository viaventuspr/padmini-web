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
      throw new Error("PDF එකෙන් ප්‍රමාණවත් අකුරු ප්‍රමාණයක් කියවිය නොහැක.");
    }

    const tryGenerate = async (modelName, version = "v1beta") => {
      // API Version එක වෙනස් කර බැලීම (v1 හෝ v1beta)
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      }, { apiVersion: version });

      const SYSTEM_PROMPT = `As Padmini Teacher, generate 5 MCQs from text in Sinhala.
      Output ONLY JSON array. 
      JSON Schema: [{"q": "ප්‍රශ්නය", "opts": ["A", "B", "C", "D"], "ans": 0, "explain": "විස්තරය", "emoji": "🌿", "topic": "මාතෘකාව"}]`;

      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nText: ${lessonText.substring(0, 8000)}`);
      const text = result.response.text();
      return JSON.parse(text.trim());
    };

    const modelsToTry = [
      { name: "gemini-2.0-flash", ver: "v1beta" },
      { name: "gemini-1.5-flash", ver: "v1" },
      { name: "gemini-1.5-flash", ver: "v1beta" },
      { name: "gemini-1.5-pro", ver: "v1" },
      { name: "gemini-pro", ver: "v1beta" } // Old but stable
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`Padmini AI: Attempting ${model.name} (${model.ver})...`);
        return await tryGenerate(model.name, model.ver);
      } catch (err) {
        if (err.status === 429) {
          console.warn(`Quota hit for ${model.name}. Waiting 2s before next model...`);
          await new Promise(r => setTimeout(r, 2000)); // 429 ආවොත් පොඩ්ඩක් ඉවසමු
        } else {
          console.warn(`${model.name} failed with status ${err.status}. Trying next...`);
        }
      }
    }

    throw new Error("පද්මිනී AI සේවාවට දැන් ගොඩක් අය සම්බන්ධ වෙලා ඉන්නවා (Quota Exceeded). කරුණාකර විනාඩි 1ක් රැඳී නැවත උත්සාහ කරන්න.");
  },

  // ✨ Deep Fix: Image (Vision) Support
  // WhatsApp මගින් ලැබෙන පින්තූර කෙලින්ම ප්‍රශ්න පත්‍ර බවට පත් කිරීම
  generateQuestionsFromImage: async (base64Data, mimeType) => {
    const key = AiService.getAPIKey();
    if (!key) throw new Error("Security Alert: AI Key එක සොයාගත නොහැක.");

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Vision සඳහා 1.5 Flash ඉතා ස්ථාවරයි

      const prompt = `As Padmini Teacher, analyze this school paper image and generate 5 MCQs in Sinhala.
      Output ONLY JSON array. 
      JSON Schema: [{"q": "ප්‍රශ්නය", "opts": ["A", "B", "C", "D"], "ans": 0, "explain": "විස්තරය", "emoji": "🌿", "topic": "මාතෘකාව"}]`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType } }
      ]);

      const text = result.response.text();
      return JSON.parse(text.trim());
    } catch (error) {
       console.error("Vision AI Error:", error);
       if (error.status === 429) throw new Error("පද්ධතිය කාර්යබහුලයි. කරුණාකර විනාඩියකින් නැවත උත්සාහ කරන්න.");
       throw new Error("පින්තූරය කියවීමට AI එකට නොහැකි විය. කරුණාකර පින්තූරය වඩාත් පැහැදිලිව ගෙන නැවත ලබා දෙන්න.");
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

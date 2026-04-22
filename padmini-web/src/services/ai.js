import { GoogleGenerativeAI } from "@google/generative-ai";

const cleanJsonResponse = (rawText) => {
    if (!rawText) return [];
    const cleaned = rawText.trim();
    try {
        const start = cleaned.indexOf('[');
        const end = cleaned.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            return JSON.parse(cleaned.substring(start, end + 1));
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Clean Error:", e);
        return [];
    }
};

const AiService = {
  getAPIKey: () => {
    return import.meta.env.VITE_GEMINI_API_KEY || "";
  },

  generateQuestionsFromText: async (lessonText) => {
    const key = AiService.getAPIKey();
    if (!key || !lessonText) throw new Error("අවශ්‍ය දත්ත ලබා දීමට නොහැක.");

    const tryGenerate = async (modelName, version) => {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 } 
      }, { apiVersion: version });

      const prompt = "As Padmini Teacher, analyze this text and generate 10 MCQs in Sinhala. Output ONLY JSON array. Schema: [{\"q\": \"question\", \"opts\": [\"a\",\"b\",\"c\",\"d\"], \"ans\": 0, \"explain\": \"hint\", \"emoji\": \"🌿\", \"topic\": \"title\"}]";
      const finalInput = prompt + "\n\nContent: " + lessonText.substring(0, 15000);
      
      const result = await model.generateContent(finalInput);
      const responseText = result.response.text();
      return cleanJsonResponse(responseText);
    };

    const models = [
      { n: "gemini-2.0-flash", v: "v1beta" },
      { n: "gemini-1.5-flash", v: "v1" }
    ];

    for (const m of models) {
      try {
        return await tryGenerate(m.n, m.v);
      } catch (err) {
        console.warn("Model failed:", m.n);
      }
    }
    throw new Error("AI පද්ධතියේ දෝෂයකි.");
  },

  generateQuestionsFromImage: async (base64Data, mimeType) => {
    const key = AiService.getAPIKey();
    if (!key) throw new Error("Key missing");

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "As Padmini Teacher, analyze this image and generate 10 MCQs in Sinhala. Output ONLY JSON array.";

      const result = await model.generateContent([
        { inlineData: { data: base64Data, mimeType: mimeType } },
        prompt
      ]);
      const responseText = result.response.text();
      return cleanJsonResponse(responseText);
    } catch (error) {
       throw new Error("පින්තූරය කියවීමට නොහැක.");
    }
  },

  explainToChild: async (question, correctAnswer) => {
    const key = AiService.getAPIKey();
    if (!key) return "නිවැරදි පිළිතුර: " + correctAnswer;
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "Padmini Teacher, explain in 1 simple Sinhala sentence why " + correctAnswer + " is correct for " + question;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      return "නිවැරදි පිළිතුර: " + correctAnswer;
    }
  }
};

export default AiService;

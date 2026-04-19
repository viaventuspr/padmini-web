import { db } from '../firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import VoiceService from './voice';

// ගුරුතුමියගේ කටහඬ කළමනාකරණය (Free Tier FireStore Base64 Hack)
export const VoiceManager = {
  loadCustomVoices: async () => {
    if (!db) return;
    try {
      const docSnap = await getDoc(doc(db, "settings", "voiceMap"));
      if (docSnap.exists()) {
        const customMap = docSnap.data().mappedVoices || {};
        VoiceService.localVoiceMap = { ...VoiceService.localVoiceMap, ...customMap };
        console.log("✅ ගුරුතුමියගේ සජීවී කටහඬවල් සම්පූර්ණයෙන්ම Load විය.");
      }
    } catch (e) {
      console.warn("Failed to load custom voices:", e);
    }
  },

  uploadAndMapVoice: async (textKey, audioBlob, onProgress) => {
    if (!db) throw new Error("Firebase තවම ක්‍රියාත්මක නැත.");
    
    // Safety check for Firestore 1MB limits - prevent exceeding ~500KB to be safe
    if (audioBlob.size > 500000) {
       throw new Error("හඬ ගොනුව විශාල වැඩියි (උපරිමය 500KB). කරුණාකර කෙටි හඬක් ලබා දෙන්න.");
    }

    if(onProgress) onProgress(30);

    // Convert Audio Blob to Base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = async () => {
        const base64DataUrl = reader.result;
        if(onProgress) onProgress(70);

        try {
          const docRef = doc(db, "settings", "voiceMap");
          // Merge the base64 string directly into Firestore Map
          await setDoc(docRef, {
            mappedVoices: {
              [textKey]: base64DataUrl
            }
          }, { merge: true });
          
          if(onProgress) onProgress(100);
          VoiceService.localVoiceMap[textKey] = base64DataUrl;
          resolve(base64DataUrl);
        } catch(err) {
          reject(err);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    });
  }
};

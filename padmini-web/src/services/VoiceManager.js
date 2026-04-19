import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import VoiceService from './voice';

// ගුරුතුමියගේ කටහඬ කළමනාකරණය කරන ලෝක මට්ටමේ සේවාව (Voice Studio Manager)
export const VoiceManager = {
  // Database එකේ සේව් කර ඇති ගුරුවරියගේ කටහඬවල් ඇප් එකට ගැනීම
  loadCustomVoices: async () => {
    if (!db) return;
    try {
      const docSnap = await getDoc(doc(db, "settings", "voiceMap"));
      if (docSnap.exists()) {
        const customMap = docSnap.data().mappedVoices || {};
        // මුල් VoiceService එකේ ඇති හඬවල් (Default TTS / local MP3s) ගුරුවරියගේ හඬ වලින් Override කිරීම
        VoiceService.localVoiceMap = { ...VoiceService.localVoiceMap, ...customMap };
        console.log("✅ ගුරුතුමියගේ සජීවී කටහඬවල් සාර්ථකව පද්ධතියට සම්බන්ධ විය.");
      }
    } catch (e) {
      console.warn("Failed to load custom voices:", e);
    }
  },

  // අලුත් කටහඬක් රෙකෝඩ් කර Cloud Storage එකට යවා Database එක Update කිරීම
  uploadAndMapVoice: async (textKey, audioBlob, onProgress) => {
    if (!storage || !db) throw new Error("Firebase තවම සම්පූර්ණයෙන් සක්‍රීය නැත.");
    
    // Hash the text loosely or use standard keys
    const fileName = `voices/teacher_${Date.now()}.webm`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, audioBlob);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if(onProgress) onProgress(progress);
        }, 
        (error) => {
          reject(error);
        }, 
        async () => {
          // Upload සම්පූර්ණයි, එබැවින් Download URL එක ගන්නවා
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Database එකට එම URL එක අදාළ වාක්‍යයට විරුද්ධව සේව් කිරීම (Merging Map)
          try {
            const docRef = doc(db, "settings", "voiceMap");
            await setDoc(docRef, {
              mappedVoices: {
                [textKey]: downloadURL
              }
            }, { merge: true });
            
            // App state එක update කිරීම
            VoiceService.localVoiceMap[textKey] = downloadURL;
            resolve(downloadURL);
          } catch(err) {
            reject(err);
          }
        }
      );
    });
  }
};

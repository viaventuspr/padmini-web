// පද්මිනී පරම හඬ සේවාව (Hybrid Voice Solution - Optimized for Local Assets)

let currentAudio = null;
let statusCallback = null;
let audioQueue = [];

const notifyStatus = (status) => {
  if (statusCallback) statusCallback(status);
};

const VoiceService = {
  onStatusChange: (callback) => {
    statusCallback = callback;
  },

  // ඔබ බාගත කළ ගොනු නාමයන් මෙහි නිවැරදිව සිතියම් කර ඇත (Mapping)
  localVoiceMap: {
    "ආයුබෝවන්!": "/audio/voice_welcome.mp3",
    "අපි පාඩම පටන් ගනිමු දරුවෝ. අවධානයෙන් උත්තර දෙන්න.": "/audio/voice_start.mp3",
    "නියමයි!": "/audio/voice_great.mp3",
    "හරිම ලස්සනයි!": "/audio/voice_beautiful.mp3",
    "වැරදියි දරුවෝ. අපි ආයෙත් උත්සාහ කරමු.": "/audio/voice_wrong.mp3",
    "අභ්‍යාස පටන් ගමු": "/audio/voice_quiz_start.mp3",
    "ඔයා අද ගොඩක් දේවල් ඉගෙන ගත්තා. ගුරුතුමියට ගොඩක් සතුටුයි!": "/audio/voice_success.mp3",
    "තව පාඩමක් ඉගෙන ගනිමුද?": "/audio/voice_next.mp3",
    "අමාරු ප්‍රශ්න පුහුණුව පටන් ගනිමු.": "/audio/voice_hard_practice.mp3"
  },

  splitText: (text) => {
    if (!text) return [];
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const chunks = cleanText.match(/.{1,160}(?:\s|$)|.{1,160}/g) || [cleanText];
    return chunks.map(c => c.trim()).filter(c => c.length > 0);
  },

  speak: async (text) => {
    if (!text) return;
    VoiceService.stop();

    const cleanText = text.trim();

    // --- පියවර 1: පටිගත කළ දේශීය හඬක් (Local Voice) තිබේදැයි බැලීම ---
    const localFile = VoiceService.localVoiceMap[cleanText];
    if (localFile) {
      try {
        await VoiceService.playFile(localFile);
        return;
      } catch (e) {
        console.warn(`Local file ${localFile} missing. Switching to AI...`);
      }
    }

    // --- පියවර 2: AI හඬ භාවිතා කිරීම ---
    const chunks = VoiceService.splitText(text);
    audioQueue = chunks;
    if (audioQueue.length > 0) {
      notifyStatus(true);
      VoiceService.playNext();
    }
  },

  playNext: async () => {
    if (audioQueue.length === 0) {
      notifyStatus(false);
      return;
    }

    const chunk = audioQueue.shift();

    // Android Native Bridge Check
    if (window.AndroidBridge && typeof window.AndroidBridge.speak === 'function') {
      try {
        window.AndroidBridge.speak(chunk);
        const estimatedTime = chunk.length * 85;
        setTimeout(() => VoiceService.playNext(), estimatedTime);
        return;
      } catch (e) {}
    }

    // Cloud TTS with fallback
    try {
      await VoiceService.playCloudTTS(chunk);
      setTimeout(() => VoiceService.playNext(), 400);
    } catch (e) {
      VoiceService.fallbackSpeak(chunk, () => {
        setTimeout(() => VoiceService.playNext(), 400);
      });
    }
  },

  playFile: (path) => {
    return new Promise((resolve, reject) => {
      currentAudio = new Audio(path);
      notifyStatus(true);
      currentAudio.onended = () => {
        notifyStatus(false);
        resolve();
      };
      currentAudio.onerror = (e) => {
        notifyStatus(false);
        reject(e);
      };
      currentAudio.play().catch(reject);
    });
  },

  playCloudTTS: (text) => {
    return new Promise((resolve, reject) => {
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.google.com.vn/translate_tts?ie=UTF-8&q=${encodedText}&tl=si&client=tw-ob`;

      currentAudio = new Audio();
      currentAudio.src = url;
      currentAudio.crossOrigin = "anonymous";

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          currentAudio.onended = resolve;
        }).catch(reject);
      } else {
        currentAudio.onended = resolve;
      }
      currentAudio.onerror = reject;
    });
  },

  stop: () => {
    audioQueue = [];
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    notifyStatus(false);
  },

  fallbackSpeak: (text, onEnd) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'si-LK';
    utterance.rate = 0.9;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    window.speechSynthesis.speak(utterance);
  }
};

export default VoiceService;

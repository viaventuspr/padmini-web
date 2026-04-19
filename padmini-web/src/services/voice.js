// පද්මිනී පරම හඬ සේවාව (Ultimate Production Hybrid Voice - Strom Enhanced)

let currentAudio = null;
let statusCallback = null;
let audioQueue = [];
const audioCache = new Map();

const notifyStatus = (status) => {
  if (statusCallback) statusCallback(status);
};

const VoiceService = {
  onStatusChange: (callback) => {
    statusCallback = callback;
  },

  // 1. Smart Pre-warming: ඇප් එක පටන් ගන්නා විටම ශබ්ද මතකයට ගනී.
  preloadAssets: () => {
    const assets = [
      "/audio/voice_welcome.mp3",
      "/audio/voice_start.mp3",
      "/audio/voice_great.mp3",
      "/audio/voice_beautiful.mp3",
      "/audio/voice_wrong.mp3",
      "/audio/voice_quiz_start.mp3",
      "/audio/voice_success.mp3"
    ];
    assets.forEach(path => {
      const audio = new Audio(path);
      audio.preload = "auto";
      audioCache.set(path, audio);
    });
  },

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

  speak: async (text) => {
    if (!text) return;
    VoiceService.stop();

    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    const localFile = VoiceService.localVoiceMap[cleanText];

    // --- පියවර 1: දේශීය හඬ (Local File) පරීක්ෂාව (Ultra Fast) ---
    if (localFile) {
      try {
        // Base64 Custom Voices (Teacher's Recordings) do not fail here!
        await VoiceService.playFile(localFile);
        return;
      } catch (e) {
        console.warn(`Local file override missing for text. Falling back to next layer...`);
      }
    }

    // --- පියවර 2: සජීවී AI හඬ (Cloud TTS) ---
    const chunks = VoiceService.splitText(cleanText);
    audioQueue = chunks;
    if (audioQueue.length > 0) {
      notifyStatus(true);
      VoiceService.playNext();
    }
  },

  splitText: (text) => {
    return text.match(/.{1,160}(?:\s|$)|.{1,160}/g) || [text];
  },

  playNext: async () => {
    if (audioQueue.length === 0) {
      notifyStatus(false);
      return;
    }

    const chunk = audioQueue.shift();

    // Android Bridge Support
    if (window.AndroidBridge?.speak) {
      window.AndroidBridge.speak(chunk);
      setTimeout(() => VoiceService.playNext(), chunk.length * 85);
      return;
    }

    try {
      await VoiceService.playCloudTTS(chunk);
      setTimeout(() => VoiceService.playNext(), 400);
    } catch (e) {
      VoiceService.fallbackSpeak(chunk, () => VoiceService.playNext());
    }
  },

  playFile: (path) => {
    return new Promise((resolve, reject) => {
      const audio = audioCache.get(path) || new Audio(path);
      currentAudio = audio;
      notifyStatus(true);
      audio.onended = () => { notifyStatus(false); resolve(); };
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  },

  playCloudTTS: (text) => {
    return new Promise((resolve, reject) => {
      // ලෝක සජීවී (Live Padmini Domain) එකේදී Google Free AI කියවන්නේ නැත (CORS අවහිරය)
      // ඒ නිසා රතු පාට Error එකක් Console එකේ දාන්නේ නැතිව කෙළින්ම Fallback එකට යවයි.
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
         return reject(new Error("Production environment overrides Google TTS. Use Base64 Teacher Voices or Native Speech."));
      }
      
      const url = `https://translate.google.com.vn/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=si&client=tw-ob`;
      const audio = new Audio(url);
      currentAudio = audio;
      audio.crossOrigin = "anonymous";
      notifyStatus(true);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  },

  stop: () => {
    audioQueue = [];
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    notifyStatus(false);
  },

  fallbackSpeak: (text, onEnd) => {
    if (!window.speechSynthesis) return onEnd?.();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'si-LK';
    utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }
};

VoiceService.preloadAssets();
export default VoiceService;

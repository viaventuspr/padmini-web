// පද්මිනී කටහඬ හඳුනාගැනීමේ සේවාව (Speech Recognition for Sinhala)

const SpeechService = {
  recognition: null,

  init: () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("මෙම Browser එක Speech Recognition සහාය නොදක්වයි.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'si-LK'; // සිංහල භාෂාව
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    return recognition;
  },

  listen: () => {
    return new Promise((resolve, reject) => {
      const recognition = SpeechService.init();
      if (!recognition) return reject("Not supported");

      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(event.error);
      };

      recognition.onspeechend = () => {
        recognition.stop();
      };
    });
  }
};

export default SpeechService;

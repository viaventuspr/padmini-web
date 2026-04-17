const voices = [
  { name: "voice_welcome.mp3", text: "ආයුබෝවන්!" },
  { name: "voice_start.mp3", text: "අපි පාඩම පටන් ගනිමු දරුවෝ. අවධානයෙන් උත්තර දෙන්න." },
  { name: "voice_great.mp3", text: "නියමයි!" },
  { name: "voice_wrong.mp3", text: "වැරදියි දරුවෝ. අපි ආයෙත් උත්සාහ කරමු." },
  { name: "voice_success.mp3", text: "ඔයා අද ගොඩක් දේවල් ඉගෙන ගත්තා. ගුරුතුමියට ගොඩක් සතුටුයි!" }
];

voices.forEach(v => {
  const url = `https://translate.google.com.vn/translate_tts?ie=UTF-8&q=${encodeURIComponent(v.text)}&tl=si&client=tw-ob`;
  window.open(url, '_blank');
});
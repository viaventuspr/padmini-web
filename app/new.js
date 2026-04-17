const voices = [
  { name: "voice_welcome.mp3", text: "ආයුබෝවන්!" },
  { name: "voice_start.mp3", text: "අපි පාඩම පටන් ගනිමු දරුවෝ. අවධානයෙන් උත්තර දෙන්න." },
  { name: "voice_great.mp3", text: "නියමයි!" },
  { name: "voice_beautiful.mp3", text: "හරිම ලස්සනයි!" },
  { name: "voice_wrong.mp3", text: "වැරදියි දරුවෝ. අපි ආයෙත් උත්සාහ කරමු." },
  { name: "voice_quiz_start.mp3", text: "අභ්‍යාස පටන් ගමු" },
  { name: "voice_success.mp3", text: "ඔයා අද ගොඩක් දේවල් ඉගෙන ගත්තා. ගුරුතුමියට ගොඩක් සතුටුයි!" },
  { name: "voice_next.mp3", text: "තව පාඩමක් ඉගෙන ගනිමුද?" },
  { name: "voice_hard_practice.mp3", text: "අමාරු ප්‍රශ්න පුහුණුව පටන් ගනිමු." }
];

voices.forEach(v => {
  const url = `https://translate.google.com.vn/translate_tts?ie=UTF-8&q=${encodeURIComponent(v.text)}&tl=si&client=tw-ob`;
  const link = document.createElement('a');
  link.href = url;
  link.download = v.name;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
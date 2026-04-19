import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import VoiceService from './services/voice'
import AiService from './services/ai'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

// --- Production Diagnostic System ---
window.VoiceService = VoiceService;
window.AiService = AiService;

console.log("%c🌸 පද්මිනී පන්තිය - සජීවී පද්ධතිය පණ ගැන්වුණා", "color: #58CC02; font-size: 20px; font-weight: bold;");

// සජීවීව Auth තත්ත්වය පරීක්ෂා කිරීම
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(`%c✅ පරිශීලකයා හඳුනා ගත්තා: ${user.email}`, "color: #1CB0F6; font-weight: bold;");
  } else {
    console.log("%c👤 පරිශීලකයා ලොග් වී නැත.", "color: #FF4B4B;");
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

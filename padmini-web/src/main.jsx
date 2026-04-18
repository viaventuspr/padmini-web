import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import VoiceService from './services/voice'
import AiService from './services/ai'

// පරීක්ෂණ කටයුතු පහසු කිරීමට සේවාවන් ගෝලීයව ලබා දෙයි
window.VoiceService = VoiceService;
window.AiService = AiService;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

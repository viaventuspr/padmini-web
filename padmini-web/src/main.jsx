import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import VoiceService from './services/voice'

// පරීක්ෂණ කටයුතු පහසු කිරීමට VoiceService එක ගෝලීයව ලබා දෙයි
window.VoiceService = VoiceService;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

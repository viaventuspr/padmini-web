package com.example.padmilingodandorid

import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {
    private lateinit var tts: TextToSpeech
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        
        // Android Native Bridge එක එකතු කිරීම
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")
        
        // Vite Dev Server එකේ link එක
        webView.loadUrl("http://10.0.2.2:5173") 
        
        setContentView(webView)

        // TTS ආරම්භ කිරීම
        tts = TextToSpeech(this, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            // සිංහල භාෂාව සැකසීම
            val result = tts.setLanguage(Locale("si", "LK"))
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                // සිංහල නැතිනම් English වලට මාරු වීම
                tts.setLanguage(Locale.US)
            }
        }
    }

    // Web එකට ලබා දෙන Interface එක
    inner class AndroidBridge {
        @JavascriptInterface
        fun speak(text: String) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ID1")
        }

        @JavascriptInterface
        fun stop() {
            tts.stop()
        }

        @JavascriptInterface
        fun isNative(): Boolean {
            return true
        }
    }

    override fun onDestroy() {
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
        super.onDestroy()
    }
}

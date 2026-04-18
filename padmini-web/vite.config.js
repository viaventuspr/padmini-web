import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'audio/*.mp3'],
      manifest: {
        name: 'පද්මිනී ගුරු තුමියගේ පන්තිය',
        short_name: 'පද්මිනී',
        description: '3 - 5 ශ්‍රේණිය පරිසරය හා සාමාන්‍ය දැනීම',
        theme_color: '#2ECC71',
        background_color: '#FFFEF7',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})

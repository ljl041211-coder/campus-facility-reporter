import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// vite-plugin-pwa generates the web app manifest and the service worker at build time
// (see Week 5 lecture, p28). In `npm run dev` the service worker is disabled by default,
// so test installation with `npm run build && npm run preview` or on the Vercel deployment.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Campus Facility Reporter',
        short_name: 'Campus Reporter',
        description: 'Report damaged outdoor campus facilities with a photo and location.',
        lang: 'en-GB',
        theme_color: '#1f6f5c',
        background_color: '#f6f7f4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})

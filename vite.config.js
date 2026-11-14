import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// vite-plugin-pwa generates the web app manifest and the service worker when the
// app is built. The service worker is NOT active in `npm run dev`, so test
// installation and offline start with `npm run build && npm run preview`, or on
// the Vercel deployment.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Download a new version in the background and use it on the next visit.
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
      workbox: {
        // Files the service worker stores so the app shell can start offline.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
      },
    }),
  ],
})

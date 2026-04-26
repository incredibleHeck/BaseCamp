import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('ffmpeg')) return 'ffmpeg-core';
            if (id.includes('node_modules/motion') || id.includes('framer-motion')) return 'premium-ui';
          },
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeManifestIcons: false,
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          globIgnores: [
            '**/*.wasm',
            '**/ffmpeg*',
            '**/framer-motion*',
            '**/assets/ffmpeg*.js',
            '**/assets/premium-*.js',
            '**/assets/motion-*.js',
          ],
          maximumFileSizeToCacheInBytes: 5_242_880,
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60},
              },
            },
          ],
        },
      }),
    ],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

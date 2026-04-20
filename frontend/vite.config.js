import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let preconnectOrigin = '';
  if (env.VITE_BACKEND_URL) {
    try {
      preconnectOrigin = new URL(env.VITE_BACKEND_URL).origin;
    } catch {
      preconnectOrigin = '';
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-api-preconnect',
        transformIndexHtml(html) {
          if (!preconnectOrigin) return html;
          const tag = `    <link rel="preconnect" href="${preconnectOrigin}" crossorigin />\n`;
          return html.replace('<head>', `<head>\n${tag}`);
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@monaco-editor') || id.includes('monaco-editor')) {
              return 'monaco';
            }
            if (id.includes('socket.io-client')) {
              return 'socket';
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux')) {
              return 'redux';
            }
          },
        },
      },
    },
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // Proxy API requests during development to avoid CORS issues.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // Mapear exactamente "xlsx" a la build ESM del navegador, sin afectar "xlsx/..."
      { find: /^xlsx$/, replacement: 'xlsx/xlsx.mjs' },
    ],
  }
});

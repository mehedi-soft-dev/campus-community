import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Requests go to relative /api and /uploads paths, which are proxied to the
// Express server. Same-origin in dev means the httpOnly auth cookie just works.
const API_TARGET = process.env.VITE_API_TARGET ?? 'http://localhost:8800';

// Brand assets (the university logo) live in the repository-root public/ folder
// so they sit alongside the project rather than inside the frontend workspace.
const publicDir = fileURLToPath(new URL('../../public', import.meta.url));

export default defineConfig({
  plugins: [react()],
  publicDir,
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      '/uploads': { target: API_TARGET, changeOrigin: true },
    },
  },
  // react-quill ships CommonJS; pre-bundling it avoids a "require is not defined"
  // error in the dev server.
  optimizeDeps: {
    include: ['react-quill'],
  },
});

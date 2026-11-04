import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves a project site from /<repository-name>/.
// In GitHub Actions GITHUB_REPOSITORY is "owner/repo"; locally set VITE_BASE or it defaults to "/".
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.VITE_BASE ?? (repo && !repo.endsWith('.github.io') ? `/${repo}/` : '/');

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // three.js and React Three Fiber are only reached through the lazy AircraftScene import,
    // so Rollup keeps them out of the initial bundle.
    chunkSizeWarningLimit: 1200,
  },
});

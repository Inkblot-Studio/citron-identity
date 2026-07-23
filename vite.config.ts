import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = __dirname
const localDsDist = resolve(repoRoot, '../citron-ds/dist')
const npmDsDist = resolve(repoRoot, 'node_modules/@citron-systems/citron-ds/dist')
const dsDist = existsSync(resolve(localDsDist, 'fonts/fonts.css')) ? localDsDist : npmDsDist

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(repoRoot, './src'),
      // Prefer monorepo citron-ds/dist; npm 2.x also exports ./fonts (1.x does not).
      '@citron-systems/citron-ds/fonts': resolve(dsDist, 'fonts/fonts.css'),
      '@citron-systems/citron-ds/css': resolve(dsDist, 'css/inkblot-variables.css'),
      '@citron-systems/citron-ds/components': resolve(dsDist, 'css/citron.css'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          form: ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
  },
  server: {
    port: 3002,
    host: true,
    fs: {
      // Monorepo: allow serving fonts/CSS from sibling citron-ds
      allow: [repoRoot, resolve(repoRoot, '../citron-ds')],
    },
  },
})

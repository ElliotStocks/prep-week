import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // relative paths so the app works at any address, including github.io subpaths
  base: './',
  plugins: [react()],
})

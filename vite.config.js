import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites from /<repo-name>/. The deploy workflow
  // sets BASE_PATH; local dev and user sites (<user>.github.io) use '/'.
  base: process.env.BASE_PATH || '/',
})

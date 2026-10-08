import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves from /hpr-agency/; Vercel (and local) from the root.
  base: process.env.GITHUB_ACTIONS ? '/hpr-agency/' : '/',
  plugins: [react(), tailwindcss()],
})

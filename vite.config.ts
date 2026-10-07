import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 47321 },
  preview: { port: 47322 },
})

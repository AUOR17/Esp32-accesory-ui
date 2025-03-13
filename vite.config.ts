import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: '', 
  },
  server: {
    host: true,
    strictPort: true,
    https: false, 
    cors: true 
  }
})

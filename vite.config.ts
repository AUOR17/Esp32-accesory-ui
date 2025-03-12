import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: './', // <- Rutas relativas para S3
  build: {
    outDir: 'dist', // <- Carpeta de salida
    assetsDir: '', // <- Evita que Vite cree una subcarpeta para archivos estáticos
  }
})

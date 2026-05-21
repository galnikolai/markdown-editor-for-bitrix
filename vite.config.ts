import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devSaveHtmlPlugin } from './vite-plugin-dev-save-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devSaveHtmlPlugin()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    }
  }
})

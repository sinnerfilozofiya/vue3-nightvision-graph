import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  build: {
    target : 'es2022',
    manifest : true,
  
    rollupOptions : {
      output: {
        assetFileNames : 'app.[ext]',
        entryFileNames : 'app.js',
      },
      input: 'src/main.js',
      preserveEntrySignatures: "strict",
    }
  }
})

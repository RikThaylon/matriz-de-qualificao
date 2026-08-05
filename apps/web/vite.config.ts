import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'r3f-drei': ['@react-three/fiber', '@react-three/drei'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'zustand', '@tanstack/react-query'],
        },
      },
    },
  },
})

import { defineConfig } from 'vite';

export default defineConfig({
  // This tells Vite where your "homepage" is
  root: './',
  
  // This ensures your build files end up in a /dist folder
  build: {
    outDir: 'dist',
  },

  server: {
    port: 5173,
    // Optional: This makes it easier to test on your phone in the same Wi-Fi
    host: true 
  }
});
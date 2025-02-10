import { defineConfig } from 'vite';
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: true, // Allow network access
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: 'ws://127.0.0.1:3000',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ]
});

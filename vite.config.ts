import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
    ],
    server: {
        proxy: {
            '/api': {
                target: 'https://api.binance.com',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: ``
            }
        }
  }
})
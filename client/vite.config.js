import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 3000,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(
        env.REACT_APP_API_URL || env.VITE_API_URL || 'http://localhost:5001'
      ),
    },
  };
});

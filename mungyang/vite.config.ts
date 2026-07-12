import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 필요한 에셋만 public 아래 심볼릭 링크로 연결한다. yangmung 전체 public을 복사하지 않는다.
  publicDir: resolve(__dirname, 'public'),
  server: {
    fs: {
      allow: [resolve(__dirname), resolve(__dirname, '../yangmung/public')],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});

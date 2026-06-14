import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // react/react-dom은 콘텐츠 수정과 무관하게 거의 안 바뀌므로
        // 별도 vendor 청크로 분리해 재배포 시 캐시 적중률을 높인다.
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});

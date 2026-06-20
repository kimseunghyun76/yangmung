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
          // 학습 콘텐츠 데이터(표현·미션·문법·어휘…)를 앱 코드와 분리 → 둘 중 하나만 바뀌어도
          // 나머지는 캐시 적중(에디트가 잦은 앱이라 PWA 캐싱과 시너지).
          // 단, sceneSentences/sceneSeeds(256KB)는 Admin 전용 lazy라 제외 — eager로 끌려오면 역효과.
          if (id.includes('/src/content/') && !id.includes('sceneSentences') && !id.includes('sceneSeeds')) {
            return 'content';
          }
        },
      },
    },
  },
});

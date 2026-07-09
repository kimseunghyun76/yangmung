import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // eslint-plugin-react-hooks v7's "recommended" preset bundles React Compiler-era
      // rules (refs/set-state-in-effect/immutability/...) that flag many pre-existing,
      // working patterns across this codebase. We only take the two long-established
      // correctness rules; the compiler-oriented ones are a separate, larger effort.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // localStorage 접근 실패(사생활 모드·용량 초과 등)를 의도적으로 무시하는 catch {}가
      // 곳곳에 있음(collection.ts/flashScores.ts/progress.ts/settings.ts/unlocks.ts) — 정상 패턴.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // 콘텐츠·에셋 생성용 1회성 유틸리티 스크립트 — src의 런타임/테스트 코드보다 반복이 빠르고
    // 디버깅 중 잠시 남겨두는 미사용 변수가 흔해 no-unused-vars는 경고로 완화.
    files: ['scripts/**/*.{ts,mjs}', '*.config.{ts,js}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettierConfig,
);

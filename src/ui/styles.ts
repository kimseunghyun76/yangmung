// 공용 스타일 — 뷰 전반에서 재사용 (인라인 스타일 중복 제거)
import type { CSSProperties } from 'react';

export const BTN: CSSProperties = {
  padding: '12px 16px', borderRadius: 10, border: '1px solid #d0d0d8',
  background: '#fff', cursor: 'pointer', fontSize: 16, textAlign: 'left',
};

export const PRIMARY: CSSProperties = { ...BTN, background: '#4f46e5', color: '#fff', textAlign: 'center' };

export const WRAP: CSSProperties = { fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 560, margin: '0 auto' };

// 앱 전역 에러 경계 — 렌더 에러·lazy 청크 로드 실패 시 흰 화면 대신 복구 UI.
// 새 배포 직후 옛 index.html이 사라진 청크를 가리켜 실패하는 경우는 1회 자동 새로고침.
import { Component, type ReactNode } from 'react';

const RELOAD_FLAG = 'yangmung:chunk-reload';

function isChunkLoadError(err: Error): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i
    .test(`${err.name}: ${err.message}`);
}

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error('[yangmung] 렌더 에러:', error);
    // 청크 로드 실패 = 배포 갱신 가능성 → 세션당 1회만 자동 새로고침 (무한 루프 방지)
    if (isChunkLoadError(error)) {
      try {
        if (!window.sessionStorage.getItem(RELOAD_FLAG)) {
          window.sessionStorage.setItem(RELOAD_FLAG, '1');
          window.location.reload();
        }
      } catch { /* noop */ }
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const chunkFail = isChunkLoadError(error);
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px', textAlign: 'center', fontFamily: 'inherit' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🐏</div>
        <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>
          {chunkFail ? '새 버전을 불러와야 해요' : '화면에 문제가 생겼어요'}
        </h1>
        <p style={{ color: 'var(--ink-soft, #57544c)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
          {chunkFail
            ? '앱이 업데이트되어 새로고침이 필요합니다. 학습 기록은 그대로 남아 있어요.'
            : '일시적인 오류일 수 있어요. 새로고침하면 대부분 해결됩니다. 학습 기록은 안전합니다.'}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              background: 'var(--accent, #b9382e)', color: '#fff',
              border: '2px solid var(--border, #15140f)', borderRadius: 12,
            }}
          >
            새로고침
          </button>
          <button
            onClick={() => { window.location.hash = '#/'; window.location.reload(); }}
            style={{
              padding: '12px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              background: 'var(--surface, #fff)', color: 'var(--ink, #15140f)',
              border: '2px solid var(--border, #15140f)', borderRadius: 12,
            }}
          >
            홈으로
          </button>
        </div>
        {!chunkFail && (
          <details style={{ marginTop: 24, textAlign: 'left', fontSize: 12, color: 'var(--ink-faint, #948f84)' }}>
            <summary style={{ cursor: 'pointer' }}>기술 정보</summary>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{error.name}: {error.message}</pre>
          </details>
        )}
      </main>
    );
  }
}

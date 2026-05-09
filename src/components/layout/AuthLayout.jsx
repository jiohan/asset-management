export default function AuthLayout({ children, onBack }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
      padding: 24,
      fontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        minHeight: 540,
        display: 'flex',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
      }}>

        {/* ── 왼쪽 브랜드 패널 ── */}
        <div style={{
          width: 300,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(155deg, #3730a3 0%, #4f46e5 45%, #6366f1 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: 36,
        }}>
          {/* 배경 장식 원 */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 280, height: 280, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -60,
            width: 220, height: 220, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />

          {/* 뒤로가기 */}
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, padding: '6px 12px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
              alignSelf: 'flex-start',
              position: 'relative', zIndex: 1,
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <BackArrow />
            돌아가기
          </button>

          {/* 브랜드 정보 */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 56, height: 56,
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.28)',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 900, color: '#fff',
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}>
              M
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: '#fff',
              letterSpacing: '-0.02em', marginBottom: 10,
            }}>
              Monimo
            </div>
            <div style={{
              fontSize: 14, color: 'rgba(255,255,255,0.65)',
              textAlign: 'center', lineHeight: 1.65,
            }}>
              엑셀 없이, 수식 없이<br />
              하루 5분으로 쓰는<br />
              개인 웹 가계부
            </div>
          </div>

          {/* 하단 특징 포인트 */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {['수입·지출 한눈에', '카테고리 예산 관리', '월간 리포트 자동생성'].map((text, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: i < 2 ? 8 : 0,
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.5)',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 오른쪽 폼 패널 ── */}
        <div style={{
          flex: 1,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 52px',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif",
    }}>

      {/* 상단 네비 */}
      <nav style={{
        height: 60,
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: '#4f46e5',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 15, fontWeight: 800,
          }}>M</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Monimo</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              height: 36, padding: '0 16px',
              border: '1.5px solid #e5e7eb', borderRadius: 8,
              background: '#fff', color: '#374151',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.color = '#4f46e5' }}
            onMouseLeave={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#374151' }}
          >
            회원가입
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              height: 36, padding: '0 16px',
              border: '1.5px solid #4f46e5', borderRadius: 8,
              background: '#4f46e5', color: '#fff',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.target.style.background = '#4338ca'}
            onMouseLeave={e => e.target.style.background = '#4f46e5'}
          >
            로그인
          </button>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}>

        {/* 배지 */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 999,
          background: '#eef2ff', color: '#4f46e5',
          fontSize: 13, fontWeight: 600, marginBottom: 28,
          border: '1px solid #c7d2fe',
        }}>
          <span style={{ fontSize: 10 }}>✦</span>
          개인 가계부, 이제 5분이면 충분합니다
        </div>

        <h1 style={{
          fontSize: 56, fontWeight: 800,
          color: '#111827', lineHeight: 1.15,
          letterSpacing: '-0.03em', marginBottom: 20,
          maxWidth: 640,
        }}>
          엑셀 없이<br />
          <span style={{ color: '#4f46e5' }}>수식 없이</span>
        </h1>

        <p style={{
          fontSize: 18, color: '#6b7280',
          lineHeight: 1.7, marginBottom: 40,
          maxWidth: 440,
        }}>
          복잡한 스프레드시트 대신, 하루 5분으로 내 돈을 파악하세요.
          수입·지출 기록부터 예산 관리까지 한 곳에서.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              height: 48, padding: '0 28px',
              background: '#4f46e5', color: '#fff',
              border: 'none', borderRadius: 10,
              fontSize: 16, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
            }}
            onMouseEnter={e => e.target.style.background = '#4338ca'}
            onMouseLeave={e => e.target.style.background = '#4f46e5'}
          >
            무료로 시작하기
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              height: 48, padding: '0 28px',
              background: '#fff', color: '#374151',
              border: '1.5px solid #e5e7eb', borderRadius: 10,
              fontSize: 16, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#9ca3af'; e.target.style.color = '#111827' }}
            onMouseLeave={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#374151' }}
          >
            로그인
          </button>
        </div>

        {/* 기능 포인트 */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 64, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {['수입·지출 기록', '카테고리 분류', '예산 관리', '월간 리포트', '계좌 관리'].map(f => (
            <span key={f} style={{
              padding: '6px 14px', borderRadius: 999,
              background: '#fff', border: '1px solid #e5e7eb',
              fontSize: 13, color: '#6b7280', fontWeight: 500,
            }}>
              {f}
            </span>
          ))}
        </div>
      </main>

    </div>
  )
}

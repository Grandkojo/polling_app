import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e293b',
          backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          padding: '60px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#3b82f6',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
              fontSize: '32px',
            }}
          >
            📊
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#3b82f6',
            }}
          >
            Polling App
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '24px',
            maxWidth: '1000px',
            lineHeight: '1.1',
          }}
        >
          Create and Share Polls Instantly
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '28px',
            textAlign: 'center',
            marginBottom: '60px',
            maxWidth: '800px',
            opacity: 0.9,
            lineHeight: '1.4',
          }}
        >
          Build engaging polls, collect responses, and analyze results in real-time. Perfect for teams, events, and community engagement.
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '24px 32px',
              borderRadius: '16px',
              border: '2px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                marginBottom: '8px',
              }}
            >
              ⚡
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              Real-time Results
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '24px 32px',
              borderRadius: '16px',
              border: '2px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                marginBottom: '8px',
              }}
            >
              🔗
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#22c55e',
              }}
            >
              Easy Sharing
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              padding: '24px 32px',
              borderRadius: '16px',
              border: '2px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                marginBottom: '8px',
              }}
            >
              📱
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#a855f7',
              }}
            >
              Mobile Ready
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            fontSize: '20px',
            opacity: 0.6,
          }}
        >
          polling-app.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

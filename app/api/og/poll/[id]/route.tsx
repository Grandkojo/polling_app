import { ImageResponse } from 'next/og';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: poll, error } = await supabaseAdmin
      .from('polls')
      .select(`
        title,
        description,
        poll_options(title),
        votes(count)
      `)
      .eq('id', params.id)
      .single();

    if (error || !poll) {
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
              color: 'white',
              fontSize: 48,
              fontWeight: 'bold',
            }}
          >
            <div>Poll Not Found</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const voteCount = poll.votes?.[0]?.count || 0;
    const optionCount = poll.poll_options?.length || 0;

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
                width: '60px',
                height: '60px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                fontSize: '24px',
              }}
            >
              📊
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              Polling App
            </div>
          </div>

          {/* Poll Title */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
              maxWidth: '1000px',
              lineHeight: '1.2',
            }}
          >
            {poll.title}
          </div>

          {/* Poll Description */}
          {poll.description && (
            <div
              style={{
                fontSize: '24px',
                textAlign: 'center',
                marginBottom: '40px',
                maxWidth: '800px',
                opacity: 0.8,
                lineHeight: '1.4',
              }}
            >
              {poll.description}
            </div>
          )}

          {/* Stats */}
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
                padding: '20px 30px',
                borderRadius: '12px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                }}
              >
                {optionCount}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  opacity: 0.8,
                }}
              >
                Options
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                padding: '20px 30px',
                borderRadius: '12px',
                border: '2px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#22c55e',
                }}
              >
                {voteCount}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  opacity: 0.8,
                }}
              >
                Votes
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '18px',
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
  } catch (error) {
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
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
          }}
        >
          <div>Error generating image</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

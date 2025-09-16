import { redirect } from 'next/navigation';
import { getPollByShareCode } from '@/lib/actions/shares';

interface ShareCodePageProps {
  params: {
    code: string;
  };
}

export default async function ShareCodePage({ params }: ShareCodePageProps) {
  const { code } = params;

  try {
    const result = await getPollByShareCode(code);
    
    if (result.success) {
      // Redirect to the poll page
      redirect(`/polls/${result.poll.id}`);
    } else {
      // Redirect to polls page with error
      redirect(`/polls?error=${encodeURIComponent(result.error)}`);
    }
  } catch (error) {
    // Redirect to polls page with generic error
    redirect('/polls?error=Invalid%20share%20link');
  }
}

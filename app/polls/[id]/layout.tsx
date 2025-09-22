import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/server";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data: poll, error } = await supabaseAdmin
      .from('polls')
      .select(`
        title,
        description,
        is_public,
        created_at,
        poll_options(title)
      `)
      .eq('id', params.id)
      .single();

    if (error || !poll) {
      return {
        title: "Poll Not Found",
        description: "The requested poll could not be found.",
      };
    }

    const pollTitle = poll.title;
    const pollDescription = poll.description || `Vote on "${pollTitle}" - ${poll.poll_options?.length || 0} options available`;
    const pollUrl = `https://polling.grandkojo.my/polls/${params.id}`;

    return {
      title: `${pollTitle} - Polling App`,
      description: pollDescription,
      openGraph: {
        type: "article",
        title: pollTitle,
        description: pollDescription,
        url: pollUrl,
        siteName: "Polling App",
        images: [
          {
            url: `/api/og/poll/${params.id}`,
            width: 1200,
            height: 630,
            alt: pollTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: pollTitle,
        description: pollDescription,
        images: [`/api/og/poll/${params.id}`],
      },
      metadataBase: new URL("https://your-domain.vercel.app"),
    };
  } catch (error) {
    return {
      title: "Poll - Polling App",
      description: "View and vote on this poll.",
    };
  }
}

export default function PollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import ShareRedirect from '@/components/ShareRedirect';

interface ShareCodePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ShareCodePage({ params }: ShareCodePageProps) {
  const { code } = await params;

  return <ShareRedirect shareCode={code} />;
}

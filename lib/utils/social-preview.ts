/**
 * Utility functions for social media previews and link sharing
 */

export interface SocialPreviewData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  siteName?: string;
}

/**
 * Generate Open Graph meta tags for a poll
 */
export function generatePollOGTags(poll: {
  id: string;
  title: string;
  description?: string;
  poll_options?: Array<{ title: string }>;
  votes?: Array<{ count: number }>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';
  const pollUrl = `${baseUrl}/polls/${poll.id}`;
  const voteCount = poll.votes?.[0]?.count || 0;
  const optionCount = poll.poll_options?.length || 0;
  
  const description = poll.description || 
    `Vote on "${poll.title}" - ${optionCount} options available${voteCount > 0 ? ` (${voteCount} votes so far)` : ''}`;

  return {
    title: `${poll.title} - Polling App`,
    description,
    url: pollUrl,
    imageUrl: `${baseUrl}/api/og/poll/${poll.id}`,
    siteName: 'Polling App',
  };
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(data: SocialPreviewData) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@pollingapp',
    'twitter:creator': '@pollingapp',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.imageUrl,
  };
}

/**
 * Generate Open Graph meta tags
 */
export function generateOGTags(data: SocialPreviewData) {
  return {
    'og:type': 'article',
    'og:title': data.title,
    'og:description': data.description,
    'og:url': data.url,
    'og:site_name': data.siteName || 'Polling App',
    'og:image': data.imageUrl,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': data.title,
  };
}

/**
 * Test social media preview URLs
 */
export const SOCIAL_PREVIEW_TESTERS = {
  facebook: 'https://developers.facebook.com/tools/debug/',
  twitter: 'https://cards-dev.twitter.com/validator',
  linkedin: 'https://www.linkedin.com/post-inspector/',
  discord: 'https://discord.com/channels/@me', // Just paste the link in Discord
  slack: 'https://slack.com/', // Just paste the link in Slack
  telegram: 'https://web.telegram.org/', // Just paste the link in Telegram
} as const;

/**
 * Validate that a URL will generate proper social previews
 */
export async function validateSocialPreview(url: string): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic URL validation
    new URL(url);
  } catch {
    errors.push('Invalid URL format');
    return { isValid: false, errors, warnings };
  }

  // Check if URL is accessible
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      errors.push(`URL returns ${response.status} status`);
    }
  } catch {
    warnings.push('Could not verify URL accessibility');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

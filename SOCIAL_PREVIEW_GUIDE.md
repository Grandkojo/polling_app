# Social Media Preview Guide

## Overview
Your polling app now includes comprehensive social media preview support! When someone shares a link to your polls on social media platforms, messaging apps, or other services, they'll see a rich preview with an image, title, and description.

## What's Implemented

### 1. Open Graph Meta Tags
- **Main site**: Dynamic OG image at `/api/og`
- **Individual polls**: Dynamic OG images at `/api/og/poll/[id]`
- **Metadata**: Title, description, image, site name, and URL

### 2. Twitter Cards
- **Card type**: `summary_large_image` (shows large preview image)
- **Content**: Poll title, description, and dynamic image
- **Handle**: @pollingapp (update this to your actual Twitter handle)

### 3. Dynamic OG Images
- **Main site**: Shows app branding and features
- **Individual polls**: Shows poll title, description, vote count, and option count
- **Size**: 1200x630 pixels (optimal for all platforms)
- **Format**: Generated using Next.js ImageResponse API

## How It Works

### For Individual Polls
1. When someone visits `/polls/[id]`, the layout generates dynamic metadata
2. The metadata includes a link to `/api/og/poll/[id]` for the preview image
3. Social platforms fetch this image and display it with the poll information

### For the Main Site
1. The root layout includes default OG tags
2. The main OG image is generated at `/api/og`
3. Shows app branding and key features

## Testing Your Social Previews

### 1. Facebook Debugger
- Visit: https://developers.facebook.com/tools/debug/
- Enter your poll URL: `https://your-domain.vercel.app/polls/[poll-id]`
- Click "Debug" to see how Facebook will display your link

### 2. Twitter Card Validator
- Visit: https://cards-dev.twitter.com/validator
- Enter your poll URL
- See how it will appear on Twitter

### 3. LinkedIn Post Inspector
- Visit: https://www.linkedin.com/post-inspector/
- Enter your poll URL
- Preview how it will look on LinkedIn

### 4. Manual Testing
- **Discord**: Paste the link in any Discord channel
- **Slack**: Share the link in a Slack channel
- **Telegram**: Send the link in a Telegram chat
- **WhatsApp**: Share the link in a WhatsApp chat

## Customization

### Update Domain
Replace `https://your-domain.vercel.app` in:
- `app/layout.tsx` (metadataBase and openGraph.url)
- `app/polls/[id]/layout.tsx` (metadataBase and pollUrl)

### Update Twitter Handle
In `app/layout.tsx`, update:
```typescript
twitter: {
  site: "@your-actual-handle",
  creator: "@your-actual-handle",
  // ...
}
```

### Customize OG Images
The OG images are generated in:
- `app/api/og/route.tsx` (main site image)
- `app/api/og/poll/[id]/route.tsx` (individual poll images)

You can modify colors, fonts, layout, and content in these files.

## Features Included

### Share Modal Preview Tab
- Added a "Preview" tab to the ShareModal
- Shows how the poll will appear on social media
- Lists supported platforms
- Displays the actual OG image

### Dynamic Content
- Poll titles and descriptions are pulled from the database
- Vote counts and option counts are displayed
- Images are generated in real-time
- Fallback handling for missing data

## Troubleshooting

### Images Not Loading
1. Check that your Vercel deployment is working
2. Verify the `/api/og` and `/api/og/poll/[id]` routes are accessible
3. Check browser console for any errors

### Preview Not Updating
1. Clear your browser cache
2. Use the social media debuggers to force refresh
3. Wait a few minutes for platforms to re-crawl your site

### Custom Domain Issues
1. Update all `https://your-domain.vercel.app` references
2. Ensure your custom domain is properly configured in Vercel
3. Test the OG image URLs directly in your browser

## Next Steps

1. **Deploy to Vercel** with your custom domain
2. **Test the previews** using the debuggers above
3. **Share some polls** on social media to see them in action
4. **Customize the OG images** to match your branding
5. **Update Twitter handles** to your actual accounts

Your polling app now has professional-grade social media preview support! 🎉

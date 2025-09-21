# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Your Supabase project should be set up
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Environment Variables Setup

### Required Environment Variables for Vercel:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-app-name.vercel.app

# Database URL (if using direct connection)
DATABASE_URL=your_database_connection_string
```

### How to Get Supabase Values:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SECRET_KEY`

### Generate NextAuth Secret:
```bash
openssl rand -base64 32
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts:**
   - Link to existing project? **No**
   - Project name: `polling-app` (or your preferred name)
   - Directory: `./`
   - Override settings? **No**

### Option B: Deploy via Vercel Dashboard

1. **Connect GitHub:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"New Project"**
   - Import your GitHub repository

2. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 3: Set Environment Variables in Vercel

1. **Go to your project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add each variable:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel domain)

## Step 4: Update Supabase Settings

### Update Site URL in Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Site URL**
3. Add to **Redirect URLs**:
   - `https://your-app-name.vercel.app/api/auth/callback/credentials`

### Update RLS Policies (if needed):
Make sure your RLS policies work with the production domain.

## Step 5: Test Deployment

1. **Visit your Vercel URL**
2. **Test core functionality:**
   - User registration/login
   - Poll creation
   - Voting
   - Share links
   - QR code generation
   - Comments system
   - Admin features

## Step 6: Custom Domain (Optional)

1. **Add Custom Domain:**
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Environment Variables:**
   - Update `NEXTAUTH_URL` to your custom domain
   - Update Supabase site URL

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Environment Variables:**
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure no trailing spaces

3. **Database Connection:**
   - Verify Supabase project is active
   - Check RLS policies
   - Ensure database migrations are applied

4. **Authentication Issues:**
   - Verify `NEXTAUTH_URL` matches your domain
   - Check Supabase redirect URLs
   - Ensure `NEXTAUTH_SECRET` is set

### Debug Commands:

```bash
# Check build locally
npm run build

# Test production build
npm run start

# Check environment variables
vercel env ls
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase project active and configured
- [ ] Database migrations applied
- [ ] RLS policies working
- [ ] Authentication flow tested
- [ ] All features working (polls, voting, sharing, QR codes, comments)
- [ ] Admin features accessible
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Error handling working
- [ ] Tests passing

## Monitoring & Analytics

### Vercel Analytics:
- Enable Vercel Analytics in dashboard
- Monitor performance and errors

### Supabase Monitoring:
- Check Supabase dashboard for usage
- Monitor database performance
- Review authentication logs

## Security Considerations

1. **Environment Variables:**
   - Never commit secrets to Git
   - Use Vercel's environment variable system
   - Rotate secrets regularly

2. **Database Security:**
   - Review RLS policies
   - Monitor database access
   - Use strong passwords

3. **Authentication:**
   - Use strong `NEXTAUTH_SECRET`
   - Enable HTTPS only
   - Monitor authentication attempts

## Performance Optimization

1. **Build Optimization:**
   - Enable Vercel's automatic optimizations
   - Use Next.js Image optimization
   - Implement proper caching

2. **Database Optimization:**
   - Add database indexes
   - Optimize queries
   - Use connection pooling

## Backup Strategy

1. **Code Backup:**
   - GitHub repository (primary)
   - Local backups

2. **Database Backup:**
   - Supabase automatic backups
   - Export data regularly

3. **Configuration Backup:**
   - Document all environment variables
   - Save Supabase configuration

## Support & Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Documentation:** [supabase.com/docs](https://supabase.com/docs)
- **NextAuth Documentation:** [next-auth.js.org](https://next-auth.js.org)

## Success! 🎉

Once deployed, your polling app will be live at:
`https://your-app-name.vercel.app`

Share your app with the world and start collecting votes! 🗳️

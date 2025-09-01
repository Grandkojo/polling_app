# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get Your Supabase Keys

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings > API**
3. **Copy the following values:**
   - **Project URL**: Use this for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: Use this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: Use this for `SUPABASE_SERVICE_ROLE_KEY`

## Example Values

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM5NzQ5NjAwLCJleHAiOjE5NTUzMjU2MDB9.your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2Mzk3NDk2MDAsImV4cCI6MTk1NTMyNTYwMH0.your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Important Notes

- **Never commit your `.env.local` file** to version control
- The `.env.local` file is already in `.gitignore`
- `NEXT_PUBLIC_` prefix makes variables available in the browser
- `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side

## After Setting Up

1. **Restart your development server** after adding the environment variables
2. **Test the connection** by trying to create a poll
3. **Check the console** for any connection errors

## Troubleshooting

If you get connection errors:

1. **Verify your Supabase URL** is correct
2. **Check that your keys** are copied correctly
3. **Ensure your database schema** is properly set up
4. **Restart the development server** after adding environment variables


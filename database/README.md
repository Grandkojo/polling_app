# Polling App Database Schema

This directory contains the complete database schema for the polling application built with Next.js and Supabase.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [API Integration](#api-integration)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## 🏗️ Overview

The database schema is designed for a scalable polling application with the following features:

- **User Management**: Authentication and user profiles
- **Poll Creation**: Create polls with multiple options
- **Voting System**: Secure voting with rate limiting
- **Real-time Updates**: Live poll results via Supabase real-time
- **QR Code Sharing**: Generate and manage share codes
- **Security**: Row Level Security (RLS) and comprehensive access control

## 🚀 Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note down your project URL and API keys
3. Go to the SQL Editor in your Supabase dashboard

### 2. Database Schema Installation

1. Copy the contents of `schema.sql`
2. Paste it into the Supabase SQL Editor
3. Execute the script to create all tables, functions, and policies

### 3. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Verify Installation

Run these queries in the Supabase SQL Editor to verify the setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'polls', 'poll_options', 'votes', 'poll_shares');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_poll_results', 'check_vote_rate_limit', 'generate_share_code');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('polls', 'poll_options', 'votes', 'poll_shares');
```

## 📊 Database Schema

### Core Tables

#### `users` (Already created by you)
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `polls`
Stores poll information and settings.

**Key Features:**
- Public/private poll visibility
- Multiple vote allowance
- Anonymous voting support
- Expiration dates
- Automatic timestamps

#### `poll_options`
Stores individual poll options with ordering.

**Key Features:**
- Ordered display of options
- Unique constraint per poll
- Cascade deletion with polls

#### `votes`
Tracks all votes with security features.

**Key Features:**
- IP address tracking
- User agent logging
- Rate limiting support
- Unique vote constraints

#### `poll_shares`
Manages QR code sharing functionality.

**Key Features:**
- Unique share codes
- Expiration dates
- Ownership tracking

### Database Functions

#### `get_poll_results(poll_uuid UUID)`
Returns formatted poll results with vote counts and percentages.

#### `check_vote_rate_limit(poll_uuid, user_ip, user_uuid)`
Prevents vote spam with configurable rate limiting.

#### `generate_share_code()`
Creates unique 8-character share codes for QR generation.

#### `is_poll_expired(poll_uuid UUID)`
Checks if a poll has passed its expiration date.

### Views

#### `poll_stats`
Provides aggregated statistics for polls including:
- Total votes
- Unique voters
- Option counts
- Expiration status

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

- **Public Access**: Anyone can view public polls
- **Owner Access**: Users can manage their own polls
- **Vote Protection**: Rate limiting and duplicate prevention
- **Share Control**: Only poll owners can create share codes

### Rate Limiting

- **Vote Rate Limit**: 1 vote per minute per IP/user
- **Configurable**: Easy to adjust limits in the database function

### Data Validation

- **Input Constraints**: Length limits on text fields
- **Referential Integrity**: Foreign key constraints
- **Unique Constraints**: Prevents duplicate data

## 🔌 API Integration

### Client-Side Usage

```typescript
import { pollsApi } from '@/lib/supabase/client';

// Get public polls
const { data, pagination } = await pollsApi.getPublicPolls(1, 10);

// Create a poll
const poll = await pollsApi.createPoll(pollData, userId);

// Vote on a poll
const vote = await pollsApi.vote(pollId, optionId, userId, ipAddress, userAgent);
```

### Server-Side Usage

```typescript
import { pollActions } from '@/lib/supabase/server';

// Server Action for creating polls
const result = await pollActions.createPoll(formData, userId);

// Server Action for voting
const result = await pollActions.vote(formData, userId);
```

### Real-time Subscriptions

```typescript
import { realtimeApi } from '@/lib/supabase/client';

// Subscribe to poll updates
const channel = realtimeApi.subscribeToPoll(pollId, (payload) => {
  console.log('New vote:', payload);
});
```

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client-side | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side | Yes |
| `NEXT_PUBLIC_APP_URL` | Your application URL | Yes |

## 🛠️ Troubleshooting

### Common Issues

#### 1. RLS Policy Errors
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'polls';

-- Re-enable RLS if needed
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
```

#### 2. Function Not Found
```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Recreate function if missing
-- Copy the function definition from schema.sql
```

#### 3. Permission Denied
```sql
-- Check user permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'polls';
```

#### 4. Rate Limiting Issues
```sql
-- Test rate limiting function
SELECT check_vote_rate_limit(
  'your-poll-id'::uuid, 
  '127.0.0.1'::inet, 
  'your-user-id'::uuid
);
```

### Performance Optimization

#### Indexes
The schema includes optimized indexes for:
- Poll queries by creation date
- Vote queries by poll and user
- Share code lookups
- Expiration date filtering

#### Query Optimization
```sql
-- Use the poll_stats view for dashboard queries
SELECT * FROM poll_stats WHERE created_by = 'user-id';

-- Use the get_poll_results function for real-time results
SELECT * FROM get_poll_results('poll-id');
```

## 📈 Monitoring

### Database Metrics
Monitor these key metrics in Supabase:
- Query performance
- Connection count
- Storage usage
- Real-time subscription count

### Application Metrics
Track these application metrics:
- Poll creation rate
- Vote submission rate
- Share code generation
- Error rates

## 🔄 Migration Strategy

When updating the schema:

1. **Backup**: Always backup your database before changes
2. **Test**: Test migrations in a development environment
3. **Rollback**: Keep rollback scripts ready
4. **Deploy**: Use Supabase migrations for production

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contributing

When modifying the schema:

1. Update the `schema.sql` file
2. Update TypeScript types in `types/database.ts`
3. Update client/server utilities if needed
4. Test all functionality
5. Update this README

---

**Note**: This schema is designed for production use with proper security measures. Always test thoroughly in a development environment before deploying to production.


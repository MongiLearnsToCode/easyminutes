# Supabase Authentication Setup

This app has been migrated from Clerk to Supabase for authentication.

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Configuration

1. Create a new Supabase project at https://supabase.com
2. Go to Settings → API to get your project URL and anon key
3. Enable the authentication providers you want to use (Google, GitHub, etc.)
4. Set up your authentication redirects in the Supabase dashboard

## Authentication Features

- Email/password authentication
- Social authentication (Google, GitHub)
- Server-side and client-side auth
- Protected routes with middleware
- Session management
- Auth UI components with Supabase Auth UI

## Migration Notes

- Removed all Clerk dependencies (@clerk/nextjs, svix)
- Replaced Clerk components with Supabase equivalents
- Updated middleware to use Supabase SSR
- Modified auth guards and protected routes
- Updated user context and session management

## Database Schema

You may need to create a users table to store additional user data:

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

# Supabase OAuth Configuration

## Required Setup to Fix Authentication Redirect

After deploying your app to Vercel, you need to configure the OAuth redirect URLs in your Supabase project:

### 1. Go to Supabase Dashboard
- Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project: `easyminutes`

### 2. Navigate to Authentication Settings
- Go to **Authentication** → **URL Configuration**

### 3. Add Redirect URLs

Add these URLs to **Site URL** and **Redirect URLs**:

#### For Local Development:
```
http://localhost:3000/auth/callback
```

#### For Production (Vercel):
```
https://your-vercel-domain.vercel.app/auth/callback
```
Replace `your-vercel-domain` with your actual Vercel domain.

### 4. OAuth Provider Configuration

For each provider (Google, GitHub), ensure the redirect URI is set to:
- **Development**: `http://localhost:3000/auth/callback`  
- **Production**: `https://your-vercel-domain.vercel.app/auth/callback`

### 5. Site URL Configuration

Set the **Site URL** to:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-vercel-domain.vercel.app`

## What Was Fixed

1. **Added Auth Callback Route**: `/auth/callback` now properly handles OAuth redirects
2. **Updated Sign-in/Sign-up Pages**: Now redirect to the callback route instead of direct dashboard
3. **Added Convex User Sync**: New users are automatically synced to Convex database
4. **Proper Redirect Logic**: Handles both development and production environments

## Testing the Fix

1. Deploy the updated code to Vercel
2. Configure Supabase OAuth URLs as above
3. Try signing in with Google or GitHub
4. You should now be redirected to `/dashboard` after successful authentication

## Troubleshooting

If authentication still doesn't work:

1. **Check Vercel Logs**: Look for errors in the function logs
2. **Check Supabase Logs**: Check Authentication logs for errors
3. **Check Browser Network Tab**: Look for failed requests during auth flow
4. **Verify Environment Variables**: Ensure all Supabase keys are correctly set in Vercel

## Environment Variables in Vercel

Make sure these are set in Vercel → Project Settings → Environment Variables:

```
NEXT_PUBLIC_CONVEX_URL=https://adjoining-okapi-741.convex.cloud
NEXT_PUBLIC_SUPABASE_URL=https://ruhgssybwklqmhrpdymg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

# Easy Minutes Deployment Guide

## Overview

Easy Minutes uses a **two-tier architecture**:
- **Frontend**: Next.js app deployed on Vercel
- **Backend**: Convex database and functions deployed on Convex Cloud

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Convex development server:**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a development deployment
   - Generate `.env.local` with development URLs
   - Watch for changes and hot-reload functions

3. **Start Next.js development server:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Step 1: Deploy Convex Backend

```bash
npx convex deploy
```

This deploys your Convex functions and database to production. Note the production URL returned (e.g., `https://adjoining-okapi-741.convex.cloud`).

### Step 2: Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set framework preset to "Next.js"

3. **Configure Environment Variables in Vercel:**
   Go to your Vercel project → Settings → Environment Variables and add:

   ```bash
   # Convex Backend (Production)
   NEXT_PUBLIC_CONVEX_URL=https://adjoining-okapi-741.convex.cloud

   # Google Gemini AI API
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   GEMINI_MODEL=gemini-1.5-pro

   # Supabase Authentication  
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret

   # Application Configuration
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

   # File Storage Configuration
   NEXT_PUBLIC_MAX_FILE_SIZE_MB=100
   NEXT_PUBLIC_ALLOWED_FILE_TYPES=.mp3,.wav,.m4a,.flac

   # Security & Environment
   ENVIRONMENT=production
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```

4. **Deploy:**
   Vercel will automatically deploy when you push to your main branch.

## Environment Variables Reference

### Required for Production:
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex production URL
- `GOOGLE_AI_API_KEY` - Google Gemini API key for transcription
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_JWT_SECRET` - Supabase JWT secret
- `NEXT_PUBLIC_APP_URL` - Your production domain

### Optional (add when needed):
- `POLAR_ACCESS_TOKEN` - For subscription management
- `POLAR_WEBHOOK_SECRET` - For Polar.sh webhooks
- `SMTP_*` - For email notifications

## Important Notes

1. **Never commit sensitive environment variables** - they're excluded in `.gitignore`
2. **Development vs Production URLs**:
   - Dev: `https://basic-vole-564.convex.cloud` (auto-generated)
   - Prod: `https://adjoining-okapi-741.convex.cloud` (from `convex deploy`)
3. **Convex deployments are independent** - deploy backend separately from frontend

## Troubleshooting

### Common Issues:

1. **"Could not find public function"** - Convex backend not deployed
   - Solution: Run `npx convex deploy`

2. **Authentication errors** - Environment variables not set
   - Solution: Check Vercel environment variables

3. **CORS errors** - Incorrect CORS_ORIGIN or NEXT_PUBLIC_APP_URL
   - Solution: Ensure URLs match your actual domain

### Useful Commands:

```bash
# Check Convex deployment status
npx convex dashboard

# View Convex logs
npx convex logs

# Reset Convex development environment
npx convex dev --reset

# Build and test locally
npm run build
npm run start
```

## Support

- [Convex Documentation](https://docs.convex.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

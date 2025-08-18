# EasyMinutes Deployment Guide

## Prerequisites

Before deploying EasyMinutes, you'll need to set up accounts with the following services:

1. **Clerk** - Authentication
2. **Convex** - Backend database and functions
3. **Google AI (Gemini)** - AI processing
4. **LemonSqueezy** - Payment processing
5. **Email Service Provider** - For sending emails
6. **Vercel** - Frontend hosting (recommended)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-convex-domain.convex.cloud

# Gemini API (for AI processing)
GEMINI_API_KEY=AIza...

# LemonSqueezy (Payment Processing)
LEMON_SQUEEZY_API_KEY=eyJ0eXAiOiJKV1Qi...
LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_...
LEMON_SQUEEZY_STORE_ID=12345

# Email Service (for sending meeting minutes)
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
EMAIL_FROM=noreply@easyminutes.com
```

## LemonSqueezy Setup

1. Create a LemonSqueezy account at https://www.lemonsqueezy.com/
2. Create a new store for EasyMinutes
3. Create a "Pro Plan" subscription product:
   - Name: EasyMinutes Pro
   - Price: $9.99/month
   - Billing interval: Monthly
4. Configure webhooks:
   - URL: `https://yourdomain.com/api/webhooks/lemonsqueezy`
   - Events: order_created, subscription_created, subscription_expired, subscription_cancelled, subscription_renewed
5. Generate API credentials:
   - Go to Settings → API
   - Create a new API key with appropriate permissions

## Deployment Steps

### 1. Convex Deployment

```bash
# Deploy Convex functions
npx convex deploy
```

### 2. Vercel Deployment (Recommended)

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Set the environment variables in Vercel project settings
4. Configure build settings:
   ```
   Build Command: next build
   Output Directory: .next
   ```

### 3. Domain Configuration

1. Point your domain's DNS to Vercel
2. Configure SSL certificate (automatic with Vercel)
3. Update `NEXT_PUBLIC_CONVEX_URL` with your production Convex domain

## Security Considerations

1. Generate secure session secrets:
   ```bash
   openssl rand -base64 32 # For NEXTAUTH_SECRET
   ```

2. Set up proper CORS policies for production domains

3. Configure rate limiting for API endpoints to prevent abuse

## Monitoring & Analytics

1. Set up error tracking (Sentry.io recommended)
2. Configure performance monitoring
3. Set up uptime monitoring and alerts

## CI/CD Pipeline (Optional)

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: npx vercel --token $VERCEL_TOKEN --prod
      - name: Deploy to Convex
        run: npx convex deploy --prod
```

## Testing Checklist

Before going live, ensure:

- [ ] Payment flow works with LemonSqueezy test mode
- [ ] Webhooks are properly delivered and processed
- [ ] Email sending functionality works correctly
- [ ] AI processing completes in under 10 seconds
- [ ] Mobile responsiveness is verified
- [ ] All export formats (PDF, DOCX) work correctly
- [ ] Subscription management flows work properly
- [ ] Analytics tracking is accurate

## Support

For deployment issues, contact the development team or refer to the service documentation:

- Clerk: https://clerk.dev/docs
- Convex: https://docs.convex.dev
- Gemini: https://ai.google.dev/docs
- LemonSqueezy: https://docs.lemonsqueezy.com
- Vercel: https://vercel.com/docs
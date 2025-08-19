# Production Deployment Guide

This guide provides detailed steps for deploying EasyMinutes to production.

## Prerequisites

Before deploying to production, ensure you have:

1. Completed all environment configuration as documented in `ENVIRONMENT.md`
2. Set up accounts with all required services:
   - **Clerk** - Authentication
   - **Convex** - Backend database and functions
   - **Google AI (Gemini)** - AI processing
   - **LemonSqueezy** - Payment processing
   - **Email Service Provider** - For sending emails
   - **Vercel** - Frontend hosting

## Production Deployment Steps

### 1. Convex Production Deployment

1. Ensure your Convex project is set up for production:
   ```bash
   npx convex deploy --prod
   ```

2. After deployment, update your environment variables with the production Convex URL:
   - `NEXT_PUBLIC_CONVEX_URL` - Get this from your Convex dashboard after production deployment

### 2. Vercel Production Deployment

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. Connect your repository to Vercel:
   - Go to [Vercel](https://vercel.com/) and sign in
   - Create a new project and connect it to your GitHub repository
   - Select the `main` branch for deployment

3. Configure environment variables in Vercel:
   - In your Vercel project settings, go to "Environment Variables"
   - Add all the variables from your `.env.production` file
   - Make sure to use your production values, not development ones
   - Important variables to configure:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `NEXT_PUBLIC_CONVEX_URL`
     - `GEMINI_API_KEY`
     - `LEMONSQUEEZY_API_KEY`
     - `LEMONSQUEEZY_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID`
     - `LEMON_SQUEEZY_PRO_VARIANT_ID`
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_USER`
     - `SMTP_PASSWORD`
     - `SMTP_FROM_EMAIL`
     - `SMTP_FROM_NAME`

4. Configure build settings in Vercel:
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install` (or `yarn install` if you're using Yarn)

5. Deploy:
   - Vercel will automatically deploy your application
   - Check the deployment logs for any errors

### 3. Domain Configuration

1. In your domain registrar's DNS settings, point your domain to Vercel:
   - Add an A record pointing to Vercel's IP addresses
   - Add a CNAME record for www subdomain (if needed)

2. In Vercel dashboard:
   - Go to your project settings
   - Navigate to "Domains"
   - Add your domain and follow the verification steps

3. SSL certificates are automatically provisioned by Vercel:
   - No additional steps are needed for SSL
   - Vercel handles certificate renewal automatically

4. Update environment variables if needed:
   - After your domain is configured, you may need to update URLs in your Clerk and LemonSqueezy dashboards

## Post-Deployment Verification

After deployment, verify that all systems are working correctly:

1. Test the full user flow:
   - Sign up/in
   - Generate meeting minutes
   - Edit minutes
   - Export minutes (Pro feature)
   - Share minutes (Pro feature)
   - Send email (Pro feature)

2. Verify webhooks:
   - Check that LemonSqueezy webhooks are being received and processed
   - Verify subscription status changes are reflected in the app

3. Test payment flow:
   - Use LemonSqueezy's test mode to verify the complete payment flow
   - Ensure users are correctly upgraded to Pro status

4. Check email functionality:
   - Send test emails to verify SMTP configuration
   - Check that emails are formatted correctly

5. Monitor performance:
   - Verify that AI processing completes in under 10 seconds
   - Check that all exports work correctly
   - Ensure mobile responsiveness

## Rollback Plan

If issues are discovered after deployment:

1. Use Vercel's rollback feature to revert to a previous deployment
2. For Convex, you can redeploy a previous version:
   ```bash
   npx convex deploy --prod --deployment-name <previous-deployment-name>
   ```

## Monitoring

Set up monitoring for your production environment:

1. Vercel Analytics:
   - Enable Vercel Analytics in your project settings
   - Monitor performance and usage metrics

2. Error Tracking:
   - Integrate Sentry.io or a similar service for error tracking
   - Set up alerts for critical errors

3. Uptime Monitoring:
   - Use a service like UptimeRobot to monitor your application's availability
   - Set up alerts for downtime

4. Performance Monitoring:
   - Use tools like Lighthouse CI to monitor performance metrics
   - Set up alerts for performance degradation
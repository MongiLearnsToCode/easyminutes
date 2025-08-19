# Environment Configuration

This document explains how to set up environment variables for different environments.

## Files

- `.env.local` - Local development environment variables
- `.env.production` - Template for production environment variables (not committed to repo)
- `.env.example` - Example environment variables

## Setup for Production

1. Copy the `.env.production` file to your production environment
2. Fill in all the required values
3. Ensure the file is not committed to the repository (it's in `.gitignore`)

The `.env.production` file contains placeholders for all required environment variables:

- LemonSqueezy credentials
- Convex configuration
- Email service credentials (SMTP)
- Gemini API key
- Clerk credentials
- Session secrets

## Email Service Configuration

For email functionality, you'll need to set up an email service provider. Here are some recommended options:

### SendGrid
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Verify a sender identity
4. Use these settings:
   - SMTP_HOST: smtp.sendgrid.net
   - SMTP_PORT: 587
   - SMTP_USER: apikey
   - SMTP_PASSWORD: your_sendgrid_api_key
   - SMTP_FROM_EMAIL: your_verified_sender@yourdomain.com
   - SMTP_FROM_NAME: EasyMinutes

### Mailgun
1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Add your domain
3. Verify your domain
4. Use these settings:
   - SMTP_HOST: smtp.mailgun.org
   - SMTP_PORT: 587
   - SMTP_USER: your_mailgun_smtp_username
   - SMTP_PASSWORD: your_mailgun_smtp_password
   - SMTP_FROM_EMAIL: your_verified_sender@yourdomain.com
   - SMTP_FROM_NAME: EasyMinutes

### Amazon SES
1. Sign up for AWS and navigate to SES
2. Verify your domain or email address
3. Create SMTP credentials
4. Use these settings:
   - SMTP_HOST: email-smtp.{region}.amazonaws.com (e.g., email-smtp.us-east-1.amazonaws.com)
   - SMTP_PORT: 587
   - SMTP_USER: your_ses_smtp_username
   - SMTP_PASSWORD: your_ses_smtp_password
   - SMTP_FROM_EMAIL: your_verified_sender@yourdomain.com
   - SMTP_FROM_NAME: EasyMinutes

## Gemini API Key Configuration

To use the AI processing features, you'll need a Gemini API key from Google AI:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your environment variables as `GEMINI_API_KEY`

Note: For production use, make sure to set appropriate usage limits on your API key to prevent unexpected charges.

## Clerk Credentials Configuration

To set up authentication, you'll need Clerk credentials:

1. Go to [Clerk.dev](https://clerk.dev/) and sign up for an account
2. Create a new application
3. In the Clerk dashboard, go to "API Keys"
4. Copy the "Publishable key" and "Secret key"
5. Add them to your environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for the publishable key
   - `CLERK_SECRET_KEY` for the secret key

Make sure to also configure your production URLs in the Clerk dashboard under "URLs":
- Frontend API URL: Your production frontend URL
- Backend API URL: Your production backend URL (Convex URL)
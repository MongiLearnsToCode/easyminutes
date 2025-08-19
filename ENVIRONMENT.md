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
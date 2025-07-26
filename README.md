This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables Setup

To run the Easy Minutes application, you need to configure the environment variables for all third-party services and application settings. This is essential to ensure all integrations are working correctly. Follow these steps:

1. **Copy the example environment file:**
   Duplicate the `.env.example` file and rename it to `.env.local`. This will be your configuration for local development.

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the required values:**
   Update the `.env.local` file with the actual credentials, access tokens, and configurations needed for your development and production environments. This includes:
   - **Convex Backend** like deployment name and URL.
   - **Google Gemini AI** integration keys.
   - **Clerk Authentication** keys and redirect settings.
   - **Polar.sh Subscription Management** tokens and secrets.
   - **App-Specific Configurations** such as CORS settings, maximum file sizes, and email communication settings.

3. **Generate security keys (if needed):**
   If certain services require generating secure keys or secrets, make sure to do this securely. You can include placeholders in the `.env.local` until you complete the setup.

Remember to keep your environment variables secure and do not commit the `.env.local` file containing sensitive credentials to version control.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

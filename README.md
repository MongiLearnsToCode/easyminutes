# EasyMinutes

EasyMinutes is a Fortune-500 standard meeting minutes generator that transforms chaotic notes into executive-ready Action Minutes in under 2 minutes.

## Features

- **Multi-Input Intelligence**: Paste text, upload DOCX/TXT, or record audio (Pro)
- **AI Processing Engine**: Powered by Google's Gemini API for <10s turnaround
- **Fortune-500 Templates**: Executive-ready Word/PDF export templates
- **Inline Editing**: Section-by-section editing with auto-versioning
- **Pro Features**: Audio transcription, shareable links, email integration

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Convex (serverless functions + database)
- **AI**: Google Gemini API
- **Auth**: Clerk
- **Payments**: LemonSqueezy
- **Deployment**: Vercel + Convex

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

## Deployment

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
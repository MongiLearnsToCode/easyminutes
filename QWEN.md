# Qwen Code Context for `easyminutes`

This document provides an overview of the `easyminutes` project for use by Qwen Code.

## Project Overview

This is a Next.js 15 application bootstrapped with `create-next-app`. It uses TypeScript, Tailwind CSS for styling, and follows the App Router structure. The project also integrates `shadcn/ui` components (as indicated by `components.json`) and uses `lucide-react` for icons.

Key technologies:
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, lucide-react
- **Fonts**: next/font (Geist)

## Building and Running

These commands are defined in `package.json`:

- **Development Server**: `npm run dev`
  - Starts the development server, typically on `http://localhost:3000`.
- **Build**: `npm run build`
  - Creates an optimized production build.
- **Start (Production)**: `npm run start`
  - Starts the production server (requires a prior build).
- **Lint**: `npm run lint`
  - Runs the configured linter (ESLint).

## Development Conventions

- **Structure**: Follows the standard Next.js App Router structure under `src/app/`.
- **Styling**: Uses Tailwind CSS extensively, with custom colors defined in `src/app/globals.css`.
- **Components**: Uses `shadcn/ui` components, which are typically located in `src/components/ui`.
- **Aliases**: The `@/*` alias maps to `./src/*` for easier imports.
- **Fonts**: Uses `next/font` to load the Geist font family.
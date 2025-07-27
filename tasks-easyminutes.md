# Task List: Easy Minutes Implementation

## Relevant Files

- `app/layout.tsx` - Root layout with Clerk provider and global styling setup
- `app/page.tsx` - Landing page with SEO-optimized copy and feature highlights
- `app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page using Clerk authentication
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page using Clerk authentication
- `app/dashboard/page.tsx` - Main dashboard showing user's meeting minutes list
- `app/dashboard/new/page.tsx` - Meeting import page for audio/text upload
- `app/dashboard/minutes/[id]/page.tsx` - Individual meeting minutes editor view
- `app/dashboard/minutes/[id]/share/page.tsx` - Sharing configuration page
- `app/api/transcribe/route.ts` - API route for Gemini AI transcription processing
- `app/api/generate-minutes/route.ts` - API route for AI minutes generation
- `app/api/webhooks/polar/route.ts` - Webhook handler for Polar.sh subscription events
- `app/api/webhooks/clerk/route.ts` - Webhook handler for Clerk user synchronization
- `docs/clerk-webhook-setup.md` - Documentation for Clerk webhook integration
- `components/ui/file-upload.tsx` - Custom file upload component with drag-and-drop and audio validation
- `components/ui/rich-text-editor.tsx` - Rich text editor for minutes editing
- `components/minutes/template-selector.tsx` - Component for choosing minute templates
- `components/minutes/action-item-manager.tsx` - Component for managing action items
- `components/sharing/share-dialog.tsx` - Modal for configuring sharing settings
- `lib/convex.ts` - Convex client configuration and query helpers
- `lib/gemini.ts` - Google Gemini API integration utilities
- `lib/polar.ts` - Polar.sh subscription management utilities
- `lib/utils/audio-processing.ts` - Audio file validation and processing utilities
- `lib/utils/minutes-parser.ts` - Text parsing and structuring utilities
- `convex/schema.ts` - Database schema definitions for meetings, users, templates, action items, notifications, and share access logs
- `convex/meetings.ts` - Convex functions for meeting CRUD operations, sharing, and status management
- `convex/users.ts` - Convex functions for user profile, subscription management, and usage tracking
- `convex/templates.ts` - Convex functions for template management and default template creation
- `middleware.ts` - Next.js middleware for authentication and route protection
- `.env.local` - Local environment variables for development
- `.env.example` - Template for environment variables configuration
- `.prettierrc.json` - Prettier configuration for code formatting
- `.prettierignore` - Files to exclude from Prettier formatting
- `eslint.config.mjs` - ESLint configuration with Next.js and Prettier integration
- `jest.config.js` - Jest testing framework configuration
- `jest.setup.js` - Jest setup file with global mocks and utilities
- `tsconfig.json` - TypeScript configuration with Jest and testing library types

### Notes

- Unit tests should be placed alongside components using `.test.tsx` or `.test.ts` extensions
- Use `npm run test` to run the Jest test suite
- Convex functions are deployed separately and don't require traditional unit tests
- API routes should include error handling and rate limiting
- All file uploads should be validated for size and type before processing

## Tasks

- [x] 1.0 Project Setup and Infrastructure
  - [x] 1.1 Initialize Next.js 14+ project with TypeScript and App Router
  - [x] 1.2 Install and configure Tailwind CSS and shadcn/ui components
- [x] 1.3 Set up Convex backend with database schema and initial functions
- [x] 1.4 Configure environment variables for all third-party services
  - [x] 1.5 Set up ESLint, Prettier, and testing framework (Jest + React Testing Library)
  - [x] 1.6 Create basic project structure with folders for components, lib, and app routes
  - [x] 1.7 Configure Next.js middleware for route protection

- [x] 2.0 Authentication and User Management
  - [x] 2.1 Install and configure Clerk authentication with social login providers
  - [x] 2.2 Set up Clerk webhooks to sync user data with Convex database
  - [x] 2.3 Create protected route layouts and authentication guards
  - [x] 2.4 Implement user profile management and preferences storage
  - [x] 2.5 Create onboarding flow for new users with template selection
- [x] 2.6 Add user authentication state management throughout the app
  - [x] 2.7 Implement user session handling and automatic token refresh

- [ ] 3.0 Meeting Import and Transcription System
  - [x] 3.1 Create file upload component with drag-and-drop support using shadcn/ui
  - [x] 3.2 Implement audio file validation (size, format, duration limits)
  - [ ] 3.3 Set up Google Gemini API integration for audio transcription
  - [ ] 3.4 Create text input interface for pasting raw meeting notes
  - [ ] 3.5 Implement upload progress tracking and status notifications
  - [ ] 3.6 Add batch processing support for multiple files
  - [ ] 3.7 Create error handling for failed transcriptions and file processing
  - [ ] 3.8 Implement audio file preprocessing and optimization before transcription

- [ ] 4.0 AI-Powered Minutes Generation and Template Management
  - [ ] 4.1 Create template system with default sections (Attendees, Agenda, Discussion, Decisions, Action Items)
  - [ ] 4.2 Implement template customization interface allowing add/remove/reorder sections
  - [ ] 4.3 Set up Gemini AI integration for intelligent minutes generation from transcribed text
  - [ ] 4.4 Create AI processing pipeline to identify key discussion points and decisions
  - [ ] 4.5 Implement automatic action item extraction and assignment features
  - [ ] 4.6 Add template saving and reuse functionality per user
  - [ ] 4.7 Create AI processing status tracking and user feedback system
  - [ ] 4.8 Implement retry mechanisms for failed AI processing requests

- [ ] 5.0 Rich Text Editor and Editing Tools
  - [ ] 5.1 Integrate rich text editor component with shadcn/ui styling
  - [ ] 5.2 Implement text highlighting and emphasis tools for key phrases
  - [ ] 5.3 Create section management tools (add, remove, reorder sections)
  - [ ] 5.4 Add drag-and-drop functionality for content reordering
  - [ ] 5.5 Implement action item assignment interface with person and due date fields
  - [ ] 5.6 Create undo/redo functionality for all editing actions
  - [ ] 5.7 Add auto-save functionality with 30-second intervals
  - [ ] 5.8 Implement collaborative editing conflict resolution (for future multi-user support)

- [ ] 6.0 Storage, Search, and Organization Features
  - [ ] 6.1 Implement secure meeting minutes storage in Convex with encryption
  - [ ] 6.2 Create meeting list view with filtering by date, title, and participants
  - [ ] 6.3 Implement full-text search functionality across all stored minutes
  - [ ] 6.4 Add advanced search filters (tags, categories, participant names, content)
  - [ ] 6.5 Create chronological list view with sorting and pagination
  - [ ] 6.6 Implement archive and delete functionality for old minutes
  - [ ] 6.7 Add data export functionality (PDF, Word, plain text formats)
  - [ ] 6.8 Create backup and data recovery systems

- [ ] 7.0 Sharing System and Notifications
  - [ ] 7.1 Implement secure link generation for meeting minutes sharing
  - [ ] 7.2 Create sharing configuration interface with expiration settings
  - [ ] 7.3 Add password protection option for shared links
  - [ ] 7.4 Implement access tracking and view logs for shared minutes
  - [ ] 7.5 Create link revocation functionality for shared content
  - [ ] 7.6 Set up email notification system for sharing activities
  - [ ] 7.7 Implement in-app notification system for processing status
  - [ ] 7.8 Add notification preferences management for users

- [ ] 8.0 Subscription Management and Freemium Implementation
  - [ ] 8.1 Integrate Polar.sh for subscription processing and management
  - [ ] 8.2 Implement freemium usage limits (5 transcriptions/month, 100MB storage)
  - [ ] 8.3 Create subscription tier enforcement throughout the application
  - [ ] 8.4 Add usage tracking and limit notifications for free tier users
  - [ ] 8.5 Implement subscription upgrade flow and payment processing
  - [ ] 8.6 Create billing management interface for Pro/Business tier users
  - [ ] 8.7 Set up webhook handling for subscription status changes
  - [ ] 8.8 Add subscription analytics and usage reporting for admin dashboard

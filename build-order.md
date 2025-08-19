# EasyMinutes Build Order (Aligned with Fortune 500 PRD)

---

## Phase 1 — Core Skeleton (Foundations)
1. Project scaffold
   - [x] Initialize Next.js + TypeScript frontend
   - [x] Setup Convex backend (functions + storage)
   - [x] Connect frontend with Convex client
2. Authentication (Clerk)
   - [x] Install & configure Clerk SDK
   - [x] Setup login, signup, logout with Clerk components/pages
   - [x] Protect Convex endpoints using Clerk session tokens
   - [x] Sync/store basic user profile (email, name, plan) in Convex

---

## Phase 2 — MVP Core Flow (The "Magic Moment")
1. Multi-input intelligence
   - [x] Text paste box with validation
   - [x] File upload (DOCX + TXT → raw text)
   - [x] Mark audio upload as **Pro-only** (stub UI in MVP, functional in Pro Phase)
2. AI Processing Engine (Gemini API)
   - [x] Convex function to call Gemini API
   - [x] Prompt template enforces Fortune 500 schema:
       - Executive Summary & Action Minutes
       - Attendees (with roles)
       - Decisions Made
       - Risks & Mitigations
       - Action Items (owner + deadline)
       - Observations & Insights
   - [x] Output normalization → JSON schema
   - [x] Ensure turnaround <10s
3. Fortune 500 output templates
   - [x] Render polished minutes from schema
   - [x] Export-ready Fortune 500 Word/PDF templates
   - [x] Consistent branded styling

---

## Phase 3 — Editing & UX Delight
1. Inline editing
   - [x] Section-by-section editing
   - [x] Add/remove sections dynamically
   - [x] Auto-save with **auto-versioning** for each edit
2. UX polish
   - [x] AI processing animation + countdown timer
   - [x] Mobile responsiveness
   - [x] Error/success messages with fallback (retry or fail-gracefully)

---

## Phase 4 — Pro Features & Monetization
1. Free tier gating
   - [x] Limit free generations to **3 per account/session**
   - [x] Upgrade prompts at **save/export/share**
2. Subscription integration
   - [x] LemonSqueezy integration
   - [x] Webhooks → Convex update Pro status
   - [x] Gate Pro-only features using Clerk roles/metadata (plan = "pro")
3. Pro-only features
   - [x] Export (PDF + DOCX with Fortune 500 template)
   - [x] Shareable link (stored in Convex)
   - [x] Email integration (send Action Minutes directly)
   - [x] Audio upload + transcription via Gemini (speech-to-text)

---

## Phase 5 — Monitoring & Optimization
1. Analytics (aligned with PRD KPIs)
   - [x] Track % of users generating Fortune-500-style minutes <2 minutes
   - [x] Track free → Pro conversions
   - [x] Track repeat usage within 7 days
   - [x] Track NPS collection (survey integration)
2. Error tracking
   - [x] Capture Gemini API failures
   - [x] Log failed uploads
   - [x] Alert/report fallback usage
3. A/B testing
   - [x] Setup feature flags in Convex
   - [x] Experiment with upgrade CTAs

---

## Phase 6 — Deployment Preparation
1. Environment configuration
   - [x] Configure LemonSqueezy credentials (API key, webhook secret, store ID)
   - [x] Setup email service credentials (SMTP settings)
   - [x] Configure Gemini API key for production
   - [x] Set up Clerk production credentials
2. Production deployment
   - [x] Deploy Convex functions to production
   - [x] Deploy Next.js frontend to Vercel
   - [x] Configure custom domain and SSL certificates
3. Payment integration completion
   - [x] Finalize LemonSqueezy product setup (Pro Plan subscription)
   - [x] Configure webhook endpoints in LemonSqueezy dashboard
   - [x] Test payment flow with test transactions
4. Security hardening
   - [ ] Generate production session secrets
   - [ ] Configure CORS policies for production domains
   - [ ] Set up rate limiting for API endpoints
5. Monitoring setup
   - [ ] Configure error tracking (Sentry.io or similar)
   - [ ] Set up performance monitoring
   - [ ] Configure uptime monitoring and alerts
6. CI/CD pipeline
   - [ ] Set up automated testing pipeline
   - [ ] Configure automatic deployments on main branch pushes
   - [ ] Set up staging environment for testing

---

## Phase 6 — Future Roadmap (Post-MVP+)
- [ ] Personalization memory (tone, jargon, structure)
- [ ] Advanced/customizable templates
- [ ] Team collaboration (shared minutes, multi-user editing)
- [ ] Multi-language support

---

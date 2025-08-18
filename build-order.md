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
   - [ ] Shareable link (stored in Convex)
   - [ ] Email integration (send Action Minutes directly)
   - [ ] Audio upload + transcription via Gemini (speech-to-text)

---

## Phase 5 — Monitoring & Optimization
1. Analytics (aligned with PRD KPIs)
   - [ ] Track % of users generating Fortune-500-style minutes <2 minutes
   - [ ] Track free → Pro conversions
   - [ ] Track repeat usage within 7 days
   - [ ] Track NPS collection (survey integration)
2. Error tracking
   - [ ] Capture Gemini API failures
   - [ ] Log failed uploads
   - [ ] Alert/report fallback usage
3. A/B testing
   - [ ] Setup feature flags in Convex
   - [ ] Experiment with upgrade CTAs

---

## Phase 6 — Future Roadmap (Post-MVP+)
- [ ] Personalization memory (tone, jargon, structure)
- [ ] Advanced/customizable templates
- [ ] Team collaboration (shared minutes, multi-user editing)
- [ ] Multi-language support

---

# Project Repurpose: Influencer Bot → Sales Lead Curator Assistant

## 🎯 Goal
Transform the existing **Influencer Bot** project into a **Curated Sales Lead Assistant** that:
- Handles **Telegram + Webchat first**, then **Email**, then **WhatsApp** (once approved).  
- Stores and manages **leads** in Supabase with a clear pipeline state.  
- Uses **short, concise LLM replies** (not long influencer-style answers).  
- Can schedule and send **follow-ups** automatically.  
- Provides a **Next.js dashboard** for oversight of leads, interactions, and progress.  
- Supports **manual takeover** from the dashboard or via terminal agent.  
- Respects **GDPR** with consents, data export, and erasure.  

---

## 🧹 Cleanup Task
Before building, clean the repo from old Influencer-specific code.  

**Remove or archive**:
- `/content_modules/`, `/offers/`, `/referrals/`, `/partners/`, `/coaching/`  
- Any influencer-specific admin pages (`/dashboard/offers`, `/dashboard/referrals`, etc.)  
- Old test data, seed scripts, content JSON.  

**Keep**:
- `/migrations/` (keep intact — they’re your DB history).  
- `.env` and secrets setup.  
- Supabase integration (keep `embeddings`, `users`, `sessions`).  
- `api/telegram-webhook.ts` (to adapt for sales).  
- Admin dashboard base layout.  

---

## 🗄 Database Adjustments
You already migrated, but ensure these tables exist:

- `leads`
  - `id uuid pk`
  - `first_name text`
  - `last_name text`
  - `email text`
  - `phone text`
  - `status text check (new, contacted, engaged, qualified, proposal, closed)`
  - `score float`
  - `source text`
  - `created_at timestamptz default now()`

- `interactions`
  - `id uuid pk`
  - `lead_id uuid fk → leads.id`
  - `channel text check (telegram, web, email, whatsapp, sms)`
  - `direction text check (inbound, outbound)`
  - `body text`
  - `created_at timestamptz default now()`

- `followups`
  - `id uuid pk`
  - `lead_id uuid fk → leads.id`
  - `trigger_type text`
  - `template_id text`
  - `next_run_at timestamptz`
  - `status text check (pending, sent, canceled)`

- `audits`
  - `id uuid pk`
  - `action text`
  - `actor text`
  - `payload jsonb`
  - `created_at timestamptz default now()`

- `embeddings`
  - Add `source_type text` (`interaction | kb`)  
  - Add `source_id uuid` (FK to either `interactions` or `kb_docs`)  

Also include the two similarity functions:
- `similarity_search`
- `similarity_search_interactions`

---

## 📡 Channels Setup
1. **Telegram**  
   - Adapt `/api/telegram-webhook.ts` → when a message comes in, create/update a `lead`, log an `interaction`, call orchestrator, and reply.  

2. **Webchat**  
   - Add a Next.js component (chat widget) → posts to `/api/webchat-webhook`.  
   - Same flow as Telegram.  

3. **Email**  
   - Add `nodemailer` integration with SMTP (direct send for now).  
   - Inbound parsing can wait — start with outbound follow-ups.  

4. **WhatsApp**  
   - Add once Cloud API is approved.  
   - Replace hardcoded Twilio approach with direct Meta Cloud API.  

---

## 🤖 Orchestrator
- Create `services/orchestrator.ts`.  
- Responsibilities:  
  - Fetch recent interactions from Supabase.  
  - Run similarity search (`interactions` + KB).  
  - Compose **short prompt**.  
  - Call **OpenRouter API** → model depends on use case:  
    - **Customer replies**: small, cost-effective chat model.  
    - **Agentic tasks/code**: Grok-code-fast (or equivalent).  
  - Return a suggested reply and lead state update.  
- Save both the reply + the reasoning in `audits`.  

---

## 📊 Dashboard Adjustments
Replace influencer views with lead CRM:

- **/dashboard/leads**
  - Table with name, email, status, score, last contact.
- **/dashboard/leads/[id]**
  - Timeline of interactions (messages in/out).
  - Follow-up schedule panel.
  - Button for “Take Over Manually”.
- **/dashboard/analytics**
  - Funnel counts: new → contacted → engaged → qualified → closed.
  - Response rate, follow-up completion.

---

## 🛠 Step-by-Step Build Order
1. **Clean repo** (remove influencer-specific modules).  
2. **Ensure DB schema** is applied (migrations already done).  
3. **Adapt Telegram webhook** → log lead + interaction.  
4. **Add orchestrator service** (`services/orchestrator.ts`).  
5. **Add CLI helper commands** (optional if you want manual testing).  
6. **Repurpose dashboard** → add leads list + detail.  
7. **Add Webchat widget** (Next.js component + API).  
8. **Add Email (SMTP)** sending for follow-ups.  
9. **Add WhatsApp** (after approval).  
10. **Polish GDPR endpoints** (export, delete).  
11. **Shadow test**: log outbound instead of sending.  
12. **Go live**: flip outbound mode to active.  

---

## ✅ Deliverables for the Agent
- Migration SQL files for new tables (`leads`, `interactions`, `followups`, `audits`).  
- `services/orchestrator.ts` with a clean function signature.  
- Adapted `/api/telegram-webhook.ts` to handle lead creation + orchestrator.  
- Updated dashboard pages (`/dashboard/leads`, `/dashboard/leads/[id]`).  
- Simple webchat widget.  
- SMTP email send service.  
- Audit logging for every AI action.  

---

## 🔒 Compliance
- Always check `leads.consent` before sending outbound.  
- Expose `/api/admin/export-lead` and `/api/admin/delete-lead` endpoints.  
- Log all autonomous sends to `audits`.  

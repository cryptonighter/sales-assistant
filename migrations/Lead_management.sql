-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NULL,
  first_name text,
  last_name text,
  email text,
  phone text,
  source text,
  status text DEFAULT 'new', -- new, contacted, engaged, qualified, proposal, negotiation, closed_won, closed_lost
  score int DEFAULT 0,
  owner_id uuid NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Interactions table (normalized messages)
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  channel text, -- telegram, whatsapp, email, webchat, sms
  direction text, -- inbound/outbound
  body text,
  metadata jsonb DEFAULT '{}'::jsonb,
  intent text NULL,
  summary text NULL,
  created_at timestamptz DEFAULT now()
);

-- Followups / scheduled automations
CREATE TABLE IF NOT EXISTS followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  trigger_type text, -- manual, cadence, event
  template_id uuid NULL,
  schedule_interval text NULL, -- human-friendly, e.g., '3d', '1w'
  next_run_at timestamptz NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Audit trail for autonomous actions
CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  actor text, -- 'human:<id>' or 'agent:grok' etc
  action text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Use existing embeddings table for KB & interactions; ensure pgvector extension installed
-- (supabase template already uses pgvector; if not, create extension)
CREATE EXTENSION IF NOT EXISTS vector;
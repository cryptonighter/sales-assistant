-- Automation Templates
CREATE TABLE IF NOT EXISTS automation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- email, sms, call, task
  subject text,
  body text,
  channel text, -- telegram, email, sms
  created_at timestamptz DEFAULT now()
);

-- Insert sample templates
INSERT INTO automation_templates (name, type, subject, body, channel) VALUES
('Follow-up 1', 'email', 'Following up on our conversation', 'Hi {{first_name}}, just checking in...', 'email'),
('Demo Invite', 'email', 'Schedule a demo', 'Hi {{first_name}}, would you like to schedule a demo?', 'email'),
('Proposal', 'email', 'Here is our proposal', 'Hi {{first_name}}, please find attached our proposal.', 'email'),
('Welcome SMS', 'sms', NULL, 'Welcome {{first_name}}! Thanks for your interest.', 'sms'),
('Reminder Call', 'call', NULL, 'Reminder call for {{first_name}}', 'call')
ON CONFLICT DO NOTHING;

-- Update followups to reference templates
ALTER TABLE followups ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES automation_templates(id);

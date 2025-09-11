// pages/api/schedule-followups.js
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get pending followups due now
    const now = new Date().toISOString();
    const { data: followups, error } = await supabaseAdmin
      .from('followups')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', now);

    if (error) throw error;

    for (const followup of followups) {
      // Get lead email
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .select('email, first_name, last_name')
        .eq('id', followup.lead_id)
        .single();

      if (lead && lead.email) {
        // Send email (placeholder, integrate with send-email API)
        console.log(`Sending followup to ${lead.email}: ${followup.template_id}`);

        // Update next_run_at (simple: add interval)
        const nextRun = new Date(Date.now() + parseInterval(followup.schedule_interval)).toISOString();
        await supabaseAdmin
          .from('followups')
          .update({ next_run_at: nextRun })
          .eq('id', followup.id);
      }
    }

    res.status(200).json({ message: 'Followups processed', count: followups.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function parseInterval(str) {
  const m = str.match(/(\d+)([dhw])/);
  if (!m) return 24 * 60 * 60 * 1000; // default 1 day
  const n = parseInt(m[1]);
  switch (m[2]) {
    case 'd': return n * 24 * 60 * 60 * 1000;
    case 'h': return n * 60 * 60 * 1000;
    case 'w': return n * 7 * 24 * 60 * 60 * 1000;
  }
}
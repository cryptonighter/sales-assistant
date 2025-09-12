// pages/api/automations/index.js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: automations, error } = await supabaseAdmin
        .from('followups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json(automations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { lead_id, trigger_type, template_id, schedule_interval } = req.body;

      const nextRun = new Date(Date.now() + parseInterval(schedule_interval)).toISOString();

      const { data: automation, error } = await supabaseAdmin
        .from('followups')
        .insert([{
          lead_id,
          trigger_type,
          template_id,
          schedule_interval,
          next_run_at: nextRun
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(automation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
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
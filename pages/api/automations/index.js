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
  const intervals = {
    '1d': 1 * 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '2w': 14 * 24 * 60 * 60 * 1000,
    '1m': 30 * 24 * 60 * 60 * 1000
  };
  return intervals[str] || 24 * 60 * 60 * 1000; // default 1 day
}
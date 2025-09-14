// pages/api/automations/templates.js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: templates, error } = await supabaseAdmin
        .from('automation_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
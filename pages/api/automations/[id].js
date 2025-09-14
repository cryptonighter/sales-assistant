// pages/api/automations/[id].js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { enabled } = req.body;

      const { data: automation, error } = await supabaseAdmin
        .from('followups')
        .update({ enabled })
        .eq('id', id)
        .select('*, automation_templates(*)')
        .single();

      if (error) throw error;

      res.status(200).json(automation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('followups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
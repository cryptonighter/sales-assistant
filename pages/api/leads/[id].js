// pages/api/leads/[id].js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError) throw leadError;

      const { data: interactions, error: intError } = await supabaseAdmin
        .from('interactions')
        .select('*')
        .eq('lead_id', id);

      if (intError) throw intError;

      res.status(200).json({ lead, interactions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { status } = req.body;
      const { error } = await supabaseAdmin
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Status updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
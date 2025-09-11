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
        .eq('lead_id', id)
        .order('created_at', { ascending: false });

      if (intError) throw intError;

      res.status(200).json({ lead, interactions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
// pages/api/admin/delete-lead/[id].js
import { supabaseAdmin } from '../../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Delete interactions
      const { error: intError } = await supabaseAdmin
        .from('interactions')
        .delete()
        .eq('lead_id', id);

      if (intError) throw intError;

      // Delete followups
      const { error: followError } = await supabaseAdmin
        .from('followups')
        .delete()
        .eq('lead_id', id);

      if (followError) throw followError;

      // Delete audits
      const { error: auditError } = await supabaseAdmin
        .from('audits')
        .delete()
        .eq('entity_id', id)
        .eq('entity_type', 'lead');

      if (auditError) throw auditError;

      // Delete lead
      const { error: leadError } = await supabaseAdmin
        .from('leads')
        .delete()
        .eq('id', id);

      if (leadError) throw leadError;

      res.status(200).json({ message: 'Lead and related data deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
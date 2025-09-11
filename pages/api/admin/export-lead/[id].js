// pages/api/admin/export-lead/[id].js
import { supabaseAdmin } from '../../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Get lead
      const { data: lead, error: leadError } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (leadError) throw leadError;

      // Get interactions
      const { data: interactions, error: intError } = await supabaseAdmin
        .from('interactions')
        .select('*')
        .eq('lead_id', id);

      if (intError) throw intError;

      // Get audits
      const { data: audits, error: auditError } = await supabaseAdmin
        .from('audits')
        .select('*')
        .eq('entity_id', id)
        .eq('entity_type', 'lead');

      if (auditError) throw auditError;

      const exportData = {
        lead,
        interactions,
        audits,
        exportedAt: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=lead-${id}-export.json`);
      res.status(200).json(exportData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
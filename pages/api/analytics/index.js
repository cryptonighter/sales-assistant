// pages/api/analytics/index.js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Lead funnel counts
      const { data: funnel, error: funnelError } = await supabaseAdmin
        .from('leads')
        .select('status')
        .then(({ data }) => {
          const counts = data.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
          }, {});
          return counts;
        });

      if (funnelError) throw funnelError;

      // Total interactions
      const { count: totalInteractions, error: intError } = await supabaseAdmin
        .from('interactions')
        .select('*', { count: 'exact', head: true });

      if (intError) throw intError;

      // Response rate (outbound / total)
      const { data: directions } = await supabaseAdmin
        .from('interactions')
        .select('direction');

      const outbound = directions.filter(d => d.direction === 'outbound').length;
      const responseRate = totalInteractions > 0 ? (outbound / totalInteractions * 100).toFixed(2) : 0;

      res.status(200).json({
        funnel,
        totalInteractions,
        responseRate: `${responseRate}%`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
// pages/api/analytics/index.js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Lead funnel counts
      const { data: funnelData, error: funnelError } = await supabaseAdmin
        .from('leads')
        .select('status');

      if (funnelError) throw funnelError;

      console.log('Funnel data:', funnelData);

      const funnel = funnelData ? funnelData.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {}) : {};

      console.log('Funnel counts:', funnel);

      // Total interactions
      const { count: totalInteractions, error: intError } = await supabaseAdmin
        .from('interactions')
        .select('*', { count: 'exact', head: true });

      if (intError) throw intError;

      console.log('Total interactions:', totalInteractions);

      // Response rate (outbound / total)
      const { data: directions, error: dirError } = await supabaseAdmin
        .from('interactions')
        .select('direction');

      if (dirError) throw dirError;

      console.log('Directions data:', directions);

      const outbound = directions ? directions.filter(d => d.direction === 'outbound').length : 0;
      const responseRate = totalInteractions > 0 ? (outbound / totalInteractions * 100).toFixed(2) : 0;

      console.log('Outbound:', outbound, 'Response rate:', responseRate);

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
// pages/api/webchat-webhook.js
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';
import { orchestrateReply } from '../../services/orchestrator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { message, leadId } = req.body;

    if (!message || !leadId) {
      return res.status(400).json({ error: 'Missing message or leadId' });
    }

    // Log inbound interaction
    const { error: inboundError } = await supabaseAdmin
      .from('interactions')
      .insert([{
        lead_id: leadId,
        channel: 'web',
        direction: 'inbound',
        body: message
      }]);

    if (inboundError) {
      console.error('Failed to log inbound:', inboundError);
    }

    // Get AI reply
    const { reply, leadUpdate } = await orchestrateReply(leadId, message);

    // Update lead if needed
    if (leadUpdate.status) {
      await supabaseAdmin
        .from('leads')
        .update({ status: leadUpdate.status })
        .eq('id', leadId);
    }

    // Log outbound
    const { error: outboundError } = await supabaseAdmin
      .from('interactions')
      .insert([{
        lead_id: leadId,
        channel: 'web',
        direction: 'outbound',
        body: reply
      }]);

    if (outboundError) {
      console.error('Failed to log outbound:', outboundError);
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Webchat webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
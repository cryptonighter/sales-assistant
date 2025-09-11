// pages/api/send-message.js
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { leadId, message, channel } = req.body;

    // Log outbound interaction
    const { error } = await supabaseAdmin
      .from('interactions')
      .insert([{
        lead_id: leadId,
        channel: channel || 'manual',
        direction: 'outbound',
        body: message
      }]);

    if (error) throw error;

    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
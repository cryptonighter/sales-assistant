// pages/api/kb/[id].js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('kb_docs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Document deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
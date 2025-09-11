// pages/api/kb/index.js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: docs, error } = await supabaseAdmin
        .from('kb_docs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content, tags } = req.body;

      const { data: doc, error } = await supabaseAdmin
        .from('kb_docs')
        .insert([{
          title,
          content,
          tags: tags ? tags.split(',').map(t => t.trim()) : []
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(doc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
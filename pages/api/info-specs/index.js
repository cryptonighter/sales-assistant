// pages/api/info-specs/index.js
import { supabaseAdmin } from '../../../lib/supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: specs, error } = await supabaseAdmin
        .from('info_specs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json(specs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { field_name, description, required } = req.body;

      const { data: spec, error } = await supabaseAdmin
        .from('info_specs')
        .insert([{
          field_name,
          description,
          required
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(spec);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
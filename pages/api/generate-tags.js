// pages/api/generate-tags.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method ' + req.method + ' Not Allowed');
  }

  try {
    const { title, content } = req.body;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Generate 3-5 relevant tags for the given document title and content. Return as JSON array.' },
          { role: 'user', content: 'Title: ' + title + '\nContent: ' + content }
        ],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error('AI API error');
    }

    const data = await response.json();
    const tagsText = data.choices[0].message.content;
    const tags = JSON.parse(tagsText);

    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

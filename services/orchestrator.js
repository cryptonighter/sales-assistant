// services/orchestrator.js
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

// Helper: Call OpenRouter API
async function callOpenRouter(messages, model = 'openai/gpt-4o-mini') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 150 // Short replies
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Main orchestrator function
export async function orchestrateReply(leadId, userMessage) {
  // Fetch recent interactions for context
  const { data: recentInteractions } = await supabaseAdmin
    .from('interactions')
    .select('body, direction, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(5);

  const context = recentInteractions.reverse().map(i => `${i.direction}: ${i.body}`).join('\n');

  // Simple prompt for sales assistant
  const systemPrompt = `You are a sales assistant. Respond concisely to customer inquiries. Keep replies short, under 150 words. Focus on qualifying leads and scheduling follow-ups.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Context:\n${context}\n\nUser: ${userMessage}` }
  ];

  // Call AI
  const reply = await callOpenRouter(messages);

  // Determine lead update (simple: if engaged, update status)
  let leadUpdate = {};
  if (reply.toLowerCase().includes('interested') || reply.toLowerCase().includes('schedule')) {
    leadUpdate.status = 'engaged';
  }

  // Log to audits
  await supabaseAdmin.from('audits').insert([{
    entity_type: 'lead',
    entity_id: leadId,
    actor: 'agent:orchestrator',
    action: 'generate_reply',
    payload: { userMessage, reply, leadUpdate }
  }]);

  return { reply, leadUpdate };
}
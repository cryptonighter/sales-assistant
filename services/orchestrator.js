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
  // Fetch lead info
  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  // Fetch recent interactions for context
  const { data: recentInteractions } = await supabaseAdmin
    .from('interactions')
    .select('body, direction, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(5);

  const context = recentInteractions.reverse().map(i => `${i.direction}: ${i.body}`).join('\n');

  // Fetch relevant KB docs (simple: by tags or content match)
  const { data: kbDocs } = await supabaseAdmin
    .from('kb_docs')
    .select('title, content')
    .limit(3); // For now, get recent

  const kbContext = kbDocs.map(d => `Doc: ${d.title} - ${d.content}`).join('\n');

  // Enhanced prompt for natural conversation
  const systemPrompt = `You are a helpful sales assistant. Engage in natural, conversational dialogue. Your goals:
  - Provide value and serve the customer.
  - Gather information about the lead (e.g., needs, budget, timeline) naturally.
  - Qualify the lead and move towards closing.
  - Use provided KB context to inform responses.
  - Keep replies concise but engaging.
  - Update lead status based on engagement: new -> contacted -> engaged -> qualified.
  - If gathering info, ask open-ended questions.
  - End with a call to action if appropriate.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Lead Info: ${JSON.stringify(lead)}\nKB Context:\n${kbContext}\nConversation:\n${context}\n\nUser: ${userMessage}` }
  ];

  // Call AI
  const reply = await callOpenRouter(messages);

  // Determine lead update
  let leadUpdate = {};
  const lowerReply = reply.toLowerCase();
  if (lowerReply.includes('interested') || lowerReply.includes('yes') || lowerReply.includes('schedule')) {
    if (lead.status === 'new') leadUpdate.status = 'contacted';
    else if (lead.status === 'contacted') leadUpdate.status = 'engaged';
  }
  // Gather info: if reply asks questions, assume gathering
  if (reply.includes('?')) {
    // Could parse for gathered info, but for now, simple
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
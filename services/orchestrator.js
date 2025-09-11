// services/orchestrator.js
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

// Helper: Call OpenRouter API
async function callOpenRouter(messages, model) {
  if (!model) model = 'openai/gpt-4o-mini';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 150 // Short replies
    })
  });

  if (!response.ok) {
    throw new Error('OpenRouter API error: ' + response.status);
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

  const context = recentInteractions.reverse().map(function(i) { return i.direction + ': ' + i.body; }).join('\n');

  // Fetch relevant KB docs (simple: by tags or content match)
  const { data: kbDocs } = await supabaseAdmin
    .from('kb_docs')
    .select('title, content')
    .limit(3); // For now, get recent

  const kbContext = kbDocs.map(function(d) { return 'Doc: ' + d.title + ' - ' + d.content; }).join('\n');

  // Fetch info specs
  const { data: infoSpecs } = await supabaseAdmin
    .from('info_specs')
    .select('field_name, description, required');

  const specsText = infoSpecs.map(function(s) { return s.field_name + ' (' + (s.required ? 'Required' : 'Optional') + '): ' + s.description; }).join('\n');

  // Enhanced prompt for natural conversation
  const systemPrompt = 'You are a helpful sales assistant. Engage in natural, conversational dialogue. Your goals:\n  - Provide value and serve the customer.\n  - Gather the following information about the lead naturally: ' + specsText + '\n  - Qualify the lead and move towards closing.\n  - Use provided KB context to inform responses.\n  - Keep replies concise but engaging.\n  - Update lead status based on engagement: new -> contacted -> engaged -> qualified.\n  - If gathering info, ask open-ended questions.\n  - End with a call to action if appropriate.';

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Lead Info: ' + JSON.stringify(lead) + '\nKB Context:\n' + kbContext + '\nConversation:\n' + context + '\n\nUser: ' + userMessage }
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
    payload: { userMessage: userMessage, reply: reply, leadUpdate: leadUpdate }
  }]);

  return { reply: reply, leadUpdate: leadUpdate };
}
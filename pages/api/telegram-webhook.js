// pages/api/telegram-webhook.js
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";
import { verifyTelegramRequest } from "../../utils/verifyTelegram.js";
import { orchestrateReply } from "../../services/orchestrator.js";

// Helper: Upsert lead from Telegram user
async function upsertLead(telegramUser) {
  const externalId = String(telegramUser.id);
  const { data: existingLead } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('source', 'telegram')
    .eq('email', externalId) // Use email as placeholder for external_id
    .single();

  if (existingLead) {
    return existingLead;
  }

  const { data: newLead } = await supabaseAdmin
    .from('leads')
    .insert([{
      first_name: telegramUser.first_name || '',
      last_name: telegramUser.last_name || '',
      email: externalId, // Placeholder
      source: 'telegram'
    }])
    .select()
    .single();

  return newLead;
}





// Main webhook
export default async function handler(req, res) {
  console.log('Update received:', JSON.stringify(req.body, null, 2));

  try {
    if (!verifyTelegramRequest(req)) {
      return res.status(400).json({ error: "Invalid Telegram webhook" });
    }

    const update = req.body;
    const message = update.message || update.edited_message;
    if (!message?.text || !message.from || !message.chat) {
      return res.status(200).json({ ok: true, skipped: "Incomplete message" });
    }

    const lead = await upsertLead(message.from);

    // Log inbound interaction
    const { error: inboundError } = await supabaseAdmin
      .from('interactions')
      .insert([{
        lead_id: lead.id,
        channel: 'telegram',
        direction: 'inbound',
        body: message.text,
        metadata: { message_id: message.message_id }
      }]);

    if (inboundError) {
      console.error('Failed to insert inbound interaction:', inboundError);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get AI reply
    const { reply, leadUpdate } = await orchestrateReply(lead.id, message.text);

    // Update lead if needed
    if (leadUpdate.status) {
      await supabaseAdmin
        .from('leads')
        .update({ status: leadUpdate.status })
        .eq('id', lead.id);
    }

    // Log outbound interaction
    const { error: outboundError } = await supabaseAdmin
      .from('interactions')
      .insert([{
        lead_id: lead.id,
        channel: 'telegram',
        direction: 'outbound',
        body: reply
      }]);

    if (outboundError) {
      console.error('Failed to insert outbound interaction:', outboundError);
    }

    // Send reply to Telegram
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: message.chat.id, text: reply, reply_to_message_id: message.message_id })
        });
        if (!telegramResponse.ok) {
          console.error('Telegram API error:', telegramResponse.status, await telegramResponse.text());
        } else {
          console.log('Reply sent successfully');
        }
      } catch (telegramError) {
        console.error('Failed to send message to Telegram:', telegramError);
      }
    } else {
      console.error('TELEGRAM_BOT_TOKEN not set');
    }

    return res.status(200).json({ ok: true, lead_id: lead.id });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    try {
      await supabaseAdmin.from('audit_logs').insert([{ action: 'telegram_webhook_error', payload: { error: error.message, body: req.body, timestamp: new Date().toISOString() } }]);
    } catch (auditError) {
      console.error('Failed to log audit:', auditError);
    }
    return res.status(500).json({ error: 'Internal server error', timestamp: new Date().toISOString() });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };
#!/usr/bin/env node

/**
 * Simple CLI for managing leads & interactions
 * Usage:
 *   ./leadctl.js list --status=engaged
 *   ./leadctl.js view <lead-id>
 *   ./leadctl.js create-lead --first Alex --last Buyer --email alex@example.com
 *   ./leadctl.js schedule-followup <lead-id> --in 3d --template nudge-1
 */

import fetch from "node-fetch";
import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

// === CONFIG ===
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
};

async function listLeads(status) {
  let url = `${SUPABASE_URL}/rest/v1/leads?select=*`;
  if (status) url += `&status=eq.${status}`;
  const res = await fetch(url, { headers });
  if (res.ok) {
    const data = await res.json();
    console.table(data.map(l => ({
      id: l.id,
      name: `${l.first_name} ${l.last_name}`,
      email: l.email,
      phone: l.phone,
      status: l.status,
      score: l.score
    })));
  } else {
    console.error("Failed to list leads:", res.status, await res.text());
  }
}

async function viewLead(id) {
  const [leadRes, intRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, { headers }),
    fetch(`${SUPABASE_URL}/rest/v1/interactions?lead_id=eq.${id}&order=created_at.desc`, { headers }),
  ]);
  if (leadRes.ok && intRes.ok) {
    const lead = (await leadRes.json())[0];
    const interactions = await intRes.json();

    console.log("\n=== LEAD INFO ===");
    console.log(lead);

    console.log("\n=== INTERACTIONS ===");
    interactions.forEach(i => {
      console.log(`[${i.created_at}] ${i.direction} via ${i.channel}: ${i.body}`);
    });
  } else {
    console.error("Failed to view lead:", leadRes.status, intRes.status, await leadRes.text(), await intRes.text());
  }
}

async function createLead(first, last, email, phone, source="manual") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      first_name: first,
      last_name: last,
      email,
      phone,
      source,
    }),
  });
  if (res.ok) {
    const text = await res.text();
    if (text) {
      try {
        const data = JSON.parse(text);
        console.log("Lead created:", data);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
      }
    } else {
      console.log("Lead created (no response body)");
    }
  } else {
    console.error("Failed to create lead:", res.status, await res.text());
  }
}

async function scheduleFollowup(leadId, interval, template) {
  const nextRun = new Date(Date.now() + parseInterval(interval)).toISOString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/followups`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      lead_id: leadId,
      trigger_type: "manual",
      schedule_interval: interval,
      template_id: template,
      next_run_at: nextRun,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    console.log("Followup scheduled:", data);
  } else {
    console.error("Failed to schedule followup:", res.status, await res.text());
  }
}

// parse "3d" or "1w" into ms
function parseInterval(str) {
  const m = str.match(/(\d+)([dhw])/);
  if (!m) throw new Error("Invalid interval: " + str);
  const n = parseInt(m[1]);
  switch (m[2]) {
    case "d": return n * 24 * 60 * 60 * 1000;
    case "h": return n * 60 * 60 * 1000;
    case "w": return n * 7 * 24 * 60 * 60 * 1000;
  }
}

// === MAIN ===
const [,, cmd, ...args] = process.argv;

(async () => {
  try {
    if (cmd === "list") {
      const status = args.find(a => a.startsWith("--status="))?.split("=")[1];
      await listLeads(status);
    } else if (cmd === "view") {
      await viewLead(args[0]);
    } else if (cmd === "create-lead") {
      const first = args[args.indexOf("--first")+1];
      const last = args[args.indexOf("--last")+1];
      const email = args.includes("--email") ? args[args.indexOf("--email")+1] : null;
      const phone = args.includes("--phone") ? args[args.indexOf("--phone")+1] : null;
      await createLead(first, last, email, phone);
    } else if (cmd === "schedule-followup") {
      const leadId = args[0];
      const interval = args.find(a => a.startsWith("--in="))?.split("=")[1];
      const template = args.find(a => a.startsWith("--template="))?.split("=")[1];
      await scheduleFollowup(leadId, interval, template);
    } else {
      console.log(`Usage:
  leadctl list [--status=engaged]
  leadctl view <lead-id>
  leadctl create-lead --first <f> --last <l> [--email <e>] [--phone <p>]
  leadctl schedule-followup <lead-id> --in=3d --template=nudge-1
      `);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
})();

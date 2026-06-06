#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const db = require('../src/integrations/db');

const args = process.argv.slice(2);
const campaignIdx = args.indexOf('--campaign');
const formatIdx = args.indexOf('--format');

const campaignId = campaignIdx !== -1 ? args[campaignIdx + 1] : null;
const format = formatIdx !== -1 ? args[formatIdx + 1] : 'jsonl';

async function main() {
  const pairs = await db.getFinetunePairs(campaignId, 5000);

  if (pairs.length === 0) {
    console.log('No LLM-handled turns found yet. Run more calls first.');
    process.exit(0);
  }

  const outFile = path.join(__dirname, `../finetune-export-${Date.now()}.${format}`);

  if (format === 'jsonl') {
    const lines = pairs.map((p) => JSON.stringify({
      messages: [
        { role: 'user', content: p.user_text },
        { role: 'assistant', content: p.assistant_text },
      ],
      metadata: { outcome: p.outcome, script_state: p.script_state },
    }));
    fs.writeFileSync(outFile, lines.join('\n'));
  } else if (format === 'csv') {
    const header = 'user_text,assistant_text,outcome,script_state\n';
    const rows = pairs.map((p) =>
      [p.user_text, p.assistant_text, p.outcome, p.script_state]
        .map((v) => `"${(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    fs.writeFileSync(outFile, header + rows.join('\n'));
  }

  console.log(`Exported ${pairs.length} pairs → ${outFile}`);
  process.exit(0);
}

main().catch((err) => { console.error(err.message); process.exit(1); });

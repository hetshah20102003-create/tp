#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { runCampaign } = require('../src/campaign');

const sheetId = process.argv[2];
if (!sheetId) {
  console.error('Usage: node scripts/start-campaign.js <google_sheet_id> [campaign_name]');
  process.exit(1);
}

const name = process.argv[3] ?? `campaign-${new Date().toISOString().slice(0, 10)}`;

runCampaign(sheetId, name)
  .then(() => { console.log('Campaign complete.'); process.exit(0); })
  .catch((err) => { console.error('Campaign failed:', err.message); process.exit(1); });

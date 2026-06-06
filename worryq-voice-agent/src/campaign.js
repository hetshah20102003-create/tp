'use strict';

require('dotenv').config();

const http = require('http');
const telephony = require('./adapters/telephony');
const sheets = require('./integrations/sheets');
const db = require('./integrations/db');
const modelsConfig = require('../config/models.json');
const logger = require('./utils/logger');

const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_CALLS ?? '5', 10);
const CALLS_PER_MINUTE = parseInt(process.env.CALLS_PER_MINUTE ?? '10', 10);
const INTERVAL_MS = (60 / CALLS_PER_MINUTE) * 1000;
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL;

async function registerPending(callSid, phone, campaignId) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ callSid, phone, campaignId });
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT ?? 3000,
      path: '/internal/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      res.on('data', () => {});
      res.on('end', resolve);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runCampaign(sheetId, campaignName = 'default') {
  const campaignId = await db.createCampaign({ name: campaignName, sheetId });
  logger.info('campaign.start', { campaignId, sheetId });

  const numbers = await sheets.getPhoneNumbers(sheetId);
  logger.info('campaign.numbers', { total: numbers.length });

  let active = 0;

  for (const { phone, row } of numbers) {
    while (active >= MAX_CONCURRENT) {
      await sleep(500);
    }

    active += 1;
    (async () => {
      try {
        const callSid = await telephony.makeCall(phone, WEBHOOK_BASE_URL);
        await registerPending(callSid, phone, campaignId);
        logger.info('campaign.call.placed', { phone, callSid });

        // Wait for call to complete (poll by checking DB — simple approach)
        // In production this would be event-driven via webhooks
        await sleep(180_000);  // max 3 min per call slot
        await sheets.markAsCalled(sheetId, row, 'done');
      } catch (err) {
        logger.error('campaign.call.error', { phone, err: err.message });
        await sheets.markAsCalled(sheetId, row, 'error').catch(() => {});
      } finally {
        active -= 1;
      }
    })();

    await sleep(INTERVAL_MS);
  }

  // Wait for all active calls to drain
  while (active > 0) await sleep(1000);
  logger.info('campaign.complete', { campaignId });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { runCampaign };

'use strict';

const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createCall({ id, campaignId, phone, status, startedAt }) {
  await pool.query(
    `INSERT INTO calls (id, campaign_id, phone, status, started_at) VALUES ($1, $2, $3, $4, $5)`,
    [id, campaignId, phone, status, startedAt]
  );
}

async function updateCall({ id, status, outcome, turnsCount, collectedData, endedAt, durationSec }) {
  await pool.query(
    `UPDATE calls SET status=$2, outcome=$3, turns_count=$4, collected_data=$5, ended_at=$6, duration_sec=$7 WHERE id=$1`,
    [id, status, outcome, turnsCount, JSON.stringify(collectedData), endedAt, durationSec]
  );
}

async function saveTurn({ callId, index, role, text, scriptState, usedLlm = false, tokens = 0 }) {
  await pool.query(
    `INSERT INTO turns (call_id, turn_index, role, text, script_state, used_llm, tokens_used) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [callId, index, role, text, scriptState, usedLlm, tokens]
  );
}

async function createCampaign({ name, sheetId, scriptVersion }) {
  const res = await pool.query(
    `INSERT INTO campaigns (name, sheet_id, script_version) VALUES ($1,$2,$3) RETURNING id`,
    [name, sheetId, scriptVersion ?? 'labour-v1']
  );
  return res.rows[0].id;
}

async function getCampaign(id) {
  const res = await pool.query(`SELECT * FROM campaigns WHERE id=$1`, [id]);
  return res.rows[0];
}

async function updateCallModels(callId, { llmModel, sttService, ttsService }) {
  await pool.query(
    `UPDATE calls SET llm_model=$2, stt_service=$3, tts_service=$4 WHERE id=$1`,
    [callId, llmModel, sttService, ttsService]
  );
}

async function getFinetunePairs(campaignId, limit = 1000) {
  const res = await pool.query(
    `SELECT user_text, assistant_text, outcome, llm_model, script_state FROM finetune_export
     WHERE ($1::uuid IS NULL OR call_id IN (SELECT id FROM calls WHERE campaign_id=$1))
     LIMIT $2`,
    [campaignId ?? null, limit]
  );
  return res.rows;
}

module.exports = { createCall, updateCall, saveTurn, createCampaign, getCampaign, updateCallModels, getFinetunePairs };

'use strict';

const https = require('https');
const modelsConfig = require('../../../config/models.json');
const logger = require('../../utils/logger');

const cfg = modelsConfig.tts.sarvam;
const API_URL = 'https://api.sarvam.ai/text-to-speech';

async function synthesize(text) {
  const body = JSON.stringify({
    inputs: [text],
    target_language_code: cfg.language,
    speaker: cfg.voice,
    model: 'bulbul:v1',
    enable_preprocessing: true,
  });

  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_TTS_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          const json = JSON.parse(Buffer.concat(chunks).toString());
          // Sarvam returns base64-encoded WAV
          const audio = Buffer.from(json.audios[0], 'base64');
          resolve(audio);
        } catch (err) {
          reject(new Error(`Sarvam TTS parse error: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { synthesize };

'use strict';

// Sarvam Saaras STT — REST-based (no streaming), used as alternative to Deepgram
const https = require('https');
const modelsConfig = require('../../../config/models.json');
const logger = require('../../utils/logger');

const cfg = modelsConfig.stt.sarvam;
const API_URL = 'https://api.sarvam.ai/speech-to-text';

async function transcribe(audioBuffer) {
  return new Promise((resolve, reject) => {
    const boundary = 'boundary' + Date.now();
    const audioChunk = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n`),
      audioBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const options = {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_STT_API_KEY,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': audioChunk.length,
      },
    };

    const url = new URL(API_URL);
    const req = https.request({ ...options, hostname: url.hostname, path: `${url.pathname}?model=${cfg.model}&language_code=${cfg.language}` }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.transcript ?? '');
        } catch {
          reject(new Error(`Sarvam STT parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(audioChunk);
    req.end();
  });
}

// Sarvam doesn't support streaming — we buffer and transcribe per utterance
function createStream(onTranscript) {
  const chunks = [];
  let silenceTimer = null;

  return {
    send: (pcmBuffer) => {
      chunks.push(pcmBuffer);
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(async () => {
        if (chunks.length === 0) return;
        const combined = Buffer.concat(chunks.splice(0));
        try {
          const text = await transcribe(combined);
          if (text) onTranscript(text.trim());
        } catch (err) {
          logger.error('sarvam.stt.error', { err: err.message });
        }
      }, 800);
    },
    close: () => { clearTimeout(silenceTimer); chunks.length = 0; },
  };
}

module.exports = { createStream, transcribe };

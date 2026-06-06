'use strict';

const https = require('https');
const modelsConfig = require('../../../config/models.json');

const cfg = modelsConfig.tts.azure;

async function getToken() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: `${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com`,
      path: '/sts/v1.0/issueToken',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
        'Content-Length': 0,
      },
    }, (res) => {
      let token = '';
      res.on('data', (c) => token += c);
      res.on('end', () => resolve(token));
    });
    req.on('error', reject);
    req.end();
  });
}

async function synthesize(text) {
  const token = await getToken();
  const ssml = `<speak version='1.0' xml:lang='${cfg.language}'>
    <voice name='${cfg.voice}'>${text}</voice>
  </speak>`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: `${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com`,
      path: '/cognitiveservices/v1',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'raw-8khz-8bit-mono-mulaw',
        'Content-Length': Buffer.byteLength(ssml),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.write(ssml);
    req.end();
  });
}

module.exports = { synthesize };

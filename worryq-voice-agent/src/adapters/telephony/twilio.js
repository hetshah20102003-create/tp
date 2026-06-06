'use strict';

const twilio = require('twilio');
const logger = require('../../utils/logger');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function makeCall(phoneNumber, webhookBaseUrl) {
  const call = await client.calls.create({
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: `${webhookBaseUrl}/twilio/answer`,
    statusCallback: `${webhookBaseUrl}/twilio/status`,
    statusCallbackEvent: ['completed', 'failed', 'no-answer', 'busy'],
    statusCallbackMethod: 'POST',
    machineDetection: 'Enable',
    machineDetectionTimeout: 5,
  });

  logger.info('twilio.call.created', { sid: call.sid, to: phoneNumber });
  return call.sid;
}

function generateAnswerTwiml(webhookBaseUrl) {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  const connect = response.connect();
  connect.stream({
    url: `wss://${new URL(webhookBaseUrl).host}/twilio/media`,
    track: 'inbound_track',
  });
  return response.toString();
}

module.exports = { makeCall, generateAnswerTwiml };

'use strict';

require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const telephony = require('./adapters/telephony');
const CallSession = require('./core/call-session');
const logger = require('./utils/logger');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT ?? 3000;
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL;

// Map of callSid → CallSession
const sessions = new Map();

// Map of callSid → WebSocket (set when media stream connects)
const sockets = new Map();

// Twilio calls this URL when the call is answered
app.post('/twilio/answer', (req, res) => {
  const callSid = req.body.CallSid;
  logger.info('twilio.answer', { callSid });
  const twiml = telephony.generateAnswerTwiml(WEBHOOK_BASE_URL);
  res.type('text/xml').send(twiml);
});

// Twilio calls this URL with call status updates
app.post('/twilio/status', (req, res) => {
  const { CallSid, CallStatus } = req.body;
  logger.info('twilio.status', { callSid: CallSid, status: CallStatus });

  if (['no-answer', 'busy', 'failed'].includes(CallStatus)) {
    const session = sessions.get(CallSid);
    if (session) session._endCall(CallStatus).catch(() => {});
  }
  res.sendStatus(200);
});

// Campaign manager calls this to register a pending session before the call connects
app.post('/internal/register', (req, res) => {
  const { callSid, phone, campaignId } = req.body;
  sessions.set(callSid, { phone, campaignId, pending: true });
  res.sendStatus(200);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/twilio/media' });

wss.on('connection', (ws) => {
  let callSid = null;
  let session = null;

  ws.on('message', async (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    if (msg.event === 'start') {
      callSid = msg.start.callSid;
      sockets.set(callSid, ws);

      const pending = sessions.get(callSid);
      if (!pending) {
        logger.warn('ws.no_session', { callSid });
        return;
      }

      const sendAudio = (mulawBuf) => {
        if (ws.readyState !== ws.OPEN) return;
        ws.send(JSON.stringify({
          event: 'media',
          streamSid: msg.start.streamSid,
          media: { payload: mulawBuf.toString('base64') },
        }));
      };

      session = new CallSession(callSid, pending.phone, pending.campaignId, sendAudio);
      sessions.set(callSid, session);
      session.start().catch((err) => logger.error('session.start.error', { err: err.message }));
    }

    if (msg.event === 'media' && session) {
      const payload = Buffer.from(msg.media.payload, 'base64');
      session.onAudio(payload);
    }

    if (msg.event === 'stop' && session) {
      if (!session.isEnded()) await session._endCall('call_ended').catch(() => {});
      sessions.delete(callSid);
      sockets.delete(callSid);
    }
  });

  ws.on('close', () => {
    if (callSid) {
      const s = sessions.get(callSid);
      if (s instanceof CallSession && !s.isEnded()) {
        s._endCall('ws_closed').catch(() => {});
      }
      sessions.delete(callSid);
      sockets.delete(callSid);
    }
  });

  ws.on('error', (err) => logger.error('ws.error', { err: err.message }));
});

server.listen(PORT, () => {
  logger.info('server.start', { port: PORT, webhook: WEBHOOK_BASE_URL });
});

module.exports = { app, server };

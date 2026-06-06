'use strict';

const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const modelsConfig = require('../../../config/models.json');
const logger = require('../../utils/logger');

const cfg = modelsConfig.stt.deepgram;

function createStream(onTranscript) {
  const dg = createClient(process.env.DEEPGRAM_API_KEY);

  const connection = dg.listen.live({
    model: cfg.model,
    language: cfg.language,
    encoding: 'linear16',
    sample_rate: 8000,
    channels: 1,
    interim_results: false,
    utterance_end_ms: 1000,
    vad_events: true,
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const alt = data.channel?.alternatives?.[0];
    if (alt?.transcript && data.is_final) {
      logger.debug('stt.transcript', { text: alt.transcript, confidence: alt.confidence });
      onTranscript(alt.transcript.trim());
    }
  });

  connection.on(LiveTranscriptionEvents.Error, (err) => {
    logger.error('deepgram.stream.error', { err: err.message });
  });

  return {
    send: (pcmBuffer) => {
      if (connection.getReadyState() === 1) connection.send(pcmBuffer);
    },
    close: () => connection.finish(),
  };
}

module.exports = { createStream };

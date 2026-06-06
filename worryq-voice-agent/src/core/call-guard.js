'use strict';

const guard = require('../../config/guard.json');
const logger = require('../utils/logger');

function hasAbuse(text) {
  const normalized = text.toLowerCase();
  return guard.abusiveKeywords.some((kw) => normalized.includes(kw));
}

function check(session, userText) {
  if (hasAbuse(userText)) {
    logger.warn('guard.cut.abuse', { callId: session.callId });
    return { cut: true, reason: 'cut_abuse' };
  }

  if (session.turns >= guard.maxTurns) {
    logger.info('guard.cut.max_turns', { callId: session.callId, turns: session.turns });
    return { cut: true, reason: 'cut_max_turns' };
  }

  if (session.strikes >= guard.offScriptStrikes) {
    logger.info('guard.cut.off_script', { callId: session.callId, strikes: session.strikes });
    return { cut: true, reason: 'cut_off_script' };
  }

  return { cut: false };
}

module.exports = { check, cutoffPhrase: guard.cutoffPhrase, silenceTimeoutMs: guard.silenceTimeoutMs };

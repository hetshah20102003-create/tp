'use strict';

const { v4: uuidv4 } = require('uuid');
const ScriptEngine = require('./script-engine');
const callGuard = require('./call-guard');
const conversation = require('./conversation');
const llm = require('../adapters/llm');
const tts = require('../adapters/tts');
const stt = require('../adapters/stt');
const db = require('../integrations/db');
const audio = require('../utils/audio');
const logger = require('../utils/logger');

class CallSession {
  constructor(callSid, phone, campaignId, send) {
    this.callId = uuidv4();
    this.callSid = callSid;
    this.phone = phone;
    this.campaignId = campaignId;
    this.send = send;           // fn(mulawBuffer) — sends audio back to Twilio
    this.state = null;
    this.history = [];
    this.turns = 0;
    this.strikes = 0;
    this.collectedData = {};
    this.startedAt = new Date();
    this.engine = new ScriptEngine('labour-v1');
    this.sttStream = null;
    this.silenceTimer = null;
    this._ended = false;
  }

  async start() {
    this.state = this.engine.initialState();

    await db.createCall({
      id: this.callId,
      campaignId: this.campaignId,
      phone: this.phone,
      status: 'connected',
      startedAt: this.startedAt,
    });

    // Start STT stream
    this.sttStream = stt.createStream((transcript) => this._onTranscript(transcript));

    // Greet
    await this._speak(this.engine.initialSay(), this.state);
    this._resetSilenceTimer();
  }

  // Called by WebSocket handler when Twilio sends audio
  onAudio(mulawBuffer) {
    if (this._ended) return;
    const pcm = audio.mulawBufferToPcm16(mulawBuffer);
    this.sttStream.send(pcm);
    this._resetSilenceTimer();
  }

  async _onTranscript(userText) {
    if (this._ended) return;
    clearTimeout(this.silenceTimer);

    logger.info('session.transcript', { callId: this.callId, text: userText });
    this.turns += 1;

    // Check guard first
    const guardResult = callGuard.check(this, userText);
    if (guardResult.cut) {
      return this._endCall(guardResult.reason);
    }

    // Save user turn to DB
    await db.saveTurn({
      callId: this.callId,
      index: this.turns * 2 - 1,
      role: 'user',
      text: userText,
      scriptState: this.state,
    });

    // Try script engine first
    const scriptResult = this.engine.advance(this.state, userText);
    let responseText, usedLlm = false, tokens = 0;

    if (scriptResult.confident) {
      this.strikes = 0;  // reset off-script counter on successful match
      responseText = scriptResult.say;

      if (scriptResult.collect) {
        this.collectedData[scriptResult.collect] = userText;
      }

      if (scriptResult.terminal) {
        await this._speak(responseText, scriptResult.nextState);
        return this._endCall(scriptResult.outcome);
      }

      this.state = scriptResult.nextState;
    } else {
      // LLM fallback for ~20% of turns
      this.strikes += 1;
      usedLlm = true;
      const ctx = conversation.buildContext(this, userText);
      const result = await llm.complete(ctx);
      responseText = result.text;
      tokens = result.tokens;

      this.history.push({ role: 'user', content: userText });
      this.history.push({ role: 'assistant', content: responseText });
    }

    // Save assistant turn
    await db.saveTurn({
      callId: this.callId,
      index: this.turns * 2,
      role: 'assistant',
      text: responseText,
      scriptState: this.state,
      usedLlm,
      tokens,
    });

    await this._speak(responseText, this.state);
    this._resetSilenceTimer();
  }

  async _speak(text, state) {
    logger.info('session.speak', { callId: this.callId, state, text });
    try {
      const wavBuffer = await tts.synthesize(text);
      // Strip WAV header (44 bytes) to get raw PCM, then convert to mulaw for Twilio
      const pcm = wavBuffer.slice(44);
      const downsampled = audio.downsample(pcm, 22050, 8000);
      const mulawBuf = audio.pcm16ToMulawBuffer(downsampled);
      this.send(mulawBuf);
    } catch (err) {
      logger.error('session.speak.error', { err: err.message });
    }
  }

  _resetSilenceTimer() {
    clearTimeout(this.silenceTimer);
    this.silenceTimer = setTimeout(() => {
      if (!this._ended) this._endCall('silence_timeout');
    }, callGuard.silenceTimeoutMs);
  }

  async _endCall(outcome) {
    if (this._ended) return;
    this._ended = true;
    clearTimeout(this.silenceTimer);

    logger.info('session.end', { callId: this.callId, outcome });

    if (outcome === 'cut_abuse' || outcome === 'cut_off_script' || outcome === 'cut_max_turns' || outcome === 'silence_timeout') {
      try {
        await this._speak(callGuard.cutoffPhrase, 'cutoff');
      } catch {}
    }

    this.sttStream?.close();

    await db.updateCall({
      id: this.callId,
      status: 'connected',
      outcome,
      turnsCount: this.turns,
      collectedData: this.collectedData,
      endedAt: new Date(),
      durationSec: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
    });
  }

  isEnded() {
    return this._ended;
  }
}

module.exports = CallSession;

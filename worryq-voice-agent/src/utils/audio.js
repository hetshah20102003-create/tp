'use strict';

// Twilio MediaStream sends 8-bit mulaw at 8kHz. Deepgram needs linear16 PCM.

function mulawToLinear16(mulawByte) {
  const MULAW_BIAS = 33;
  let b = ~mulawByte & 0xff;
  let exponent = (b >> 4) & 0x07;
  let mantissa = b & 0x0f;
  let sample = ((mantissa << 1) + MULAW_BIAS) << exponent;
  return (mulawByte & 0x80) ? -sample : sample;
}

function mulawBufferToPcm16(mulawBuffer) {
  const pcm = Buffer.allocUnsafe(mulawBuffer.length * 2);
  for (let i = 0; i < mulawBuffer.length; i++) {
    const sample = mulawToLinear16(mulawBuffer[i]);
    pcm.writeInt16LE(sample, i * 2);
  }
  return pcm;
}

// Sarvam TTS returns PCM 22050Hz mono — resample down to 8kHz for Twilio mulaw output
function linear16ToMulaw(sample) {
  const MULAW_BIAS = 33;
  const MULAW_CLIP = 32635;
  let sign = (sample >> 8) & 0x80;
  if (sign) sample = -sample;
  if (sample > MULAW_CLIP) sample = MULAW_CLIP;
  sample += MULAW_BIAS;
  let exponent = 7;
  for (let expMask = 0x4000; (sample & expMask) === 0 && exponent > 0; exponent--, expMask >>= 1) {}
  let mantissa = (sample >> (exponent + 3)) & 0x0f;
  return ~(sign | (exponent << 4) | mantissa) & 0xff;
}

function pcm16ToMulawBuffer(pcmBuffer) {
  const samples = pcmBuffer.length / 2;
  const mulaw = Buffer.allocUnsafe(samples);
  for (let i = 0; i < samples; i++) {
    mulaw[i] = linear16ToMulaw(pcmBuffer.readInt16LE(i * 2));
  }
  return mulaw;
}

// Simple downsample from srcRate to 8000 by averaging blocks
function downsample(pcmBuffer, srcRate, dstRate = 8000) {
  if (srcRate === dstRate) return pcmBuffer;
  const ratio = srcRate / dstRate;
  const srcSamples = pcmBuffer.length / 2;
  const dstSamples = Math.floor(srcSamples / ratio);
  const out = Buffer.allocUnsafe(dstSamples * 2);
  for (let i = 0; i < dstSamples; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), srcSamples);
    let sum = 0;
    for (let j = start; j < end; j++) sum += pcmBuffer.readInt16LE(j * 2);
    out.writeInt16LE(Math.round(sum / (end - start)), i * 2);
  }
  return out;
}

module.exports = { mulawBufferToPcm16, pcm16ToMulawBuffer, downsample };

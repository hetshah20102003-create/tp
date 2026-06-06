'use strict';

const OpenAI = require('openai');
const modelsConfig = require('../../../config/models.json');
const logger = require('../../utils/logger');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cfg = modelsConfig.llm.openai;

async function complete(context) {
  const { system, messages, max_tokens } = context;
  const start = Date.now();

  const response = await client.chat.completions.create({
    model: cfg.model,
    max_tokens: max_tokens ?? cfg.maxTokens,
    messages: [
      { role: 'system', content: system },
      ...messages,
    ],
  });

  const text = response.choices[0]?.message?.content ?? '';
  const tokens = response.usage?.total_tokens ?? 0;
  logger.debug('openai.complete', { ms: Date.now() - start, tokens, model: cfg.model });

  return { text, tokens };
}

module.exports = { complete };

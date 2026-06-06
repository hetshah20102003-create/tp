'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const modelsConfig = require('../../../config/models.json');
const logger = require('../../utils/logger');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const cfg = modelsConfig.llm.claude;

async function complete(context) {
  const { system, messages, max_tokens } = context;
  const start = Date.now();

  const response = await client.messages.create({
    model: cfg.model,
    max_tokens: max_tokens ?? cfg.maxTokens,
    system,
    messages,
  });

  const text = response.content[0]?.text ?? '';
  const tokens = response.usage?.input_tokens + response.usage?.output_tokens;
  logger.debug('claude.complete', { ms: Date.now() - start, tokens, model: cfg.model });

  return { text, tokens };
}

module.exports = { complete };

import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY, CLAUDE_MODEL } from "../config.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { toolDefinitions, executeTool } from "./tools.js";

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const MAX_TOOL_ROUNDS = 6;

/**
 * @param {{role: 'user'|'assistant', content: string}[]} history - prior turns, oldest first
 * @param {string} userMessage - the new incoming message
 * @param {{customerPhone: string, notifyAdmins: (text: string) => Promise<void>}} context
 * @returns {Promise<string>} the assistant's reply text
 */
export async function runAgent(history, userMessage, context) {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      return response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const result = await executeTool(block.name, block.input, context);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return "Sorry, I'm having trouble processing that right now. Please try rephrasing, or type /agent to talk to a human.";
}

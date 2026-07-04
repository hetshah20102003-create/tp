import { ADMIN_NUMBERS, RATE_LIMIT_PER_MINUTE } from "../config.js";
import { customers, conversations, settings } from "../db/repos.js";
import { handleCommand } from "./commands.js";
import { runAgent } from "../agent/agent.js";
import { sendText } from "./connection.js";

const rateLimitLog = new Map(); // phone -> array of recent message timestamps (ms)

function isRateLimited(phone) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = (rateLimitLog.get(phone) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  rateLimitLog.set(phone, timestamps);
  return timestamps.length > RATE_LIMIT_PER_MINUTE;
}

/**
 * Handles one incoming WhatsApp message. Wired up as the callback passed to startWhatsApp().
 */
export async function handleIncomingMessage({ phone, jid, text, sock }) {
  const notifyAdmins = async (msg) => {
    for (const adminPhone of ADMIN_NUMBERS) {
      await sendText(sock, adminPhone, msg);
    }
  };

  customers.upsert(phone);
  const isAdmin = ADMIN_NUMBERS.includes(phone);

  if (!isAdmin && isRateLimited(phone)) {
    await sendText(sock, jid, "You're sending messages too quickly — please wait a moment and try again.");
    return;
  }

  const commandReply = await handleCommand(text, { phone, isAdmin, notifyAdmins });
  if (commandReply !== null) {
    await sendText(sock, jid, commandReply);
    return;
  }

  if (isAdmin) {
    // Admin sent a plain-text (non-command) message directly to the bot number — nothing to do.
    return;
  }

  if (settings.isPaused() || settings.isHumanTakeover(phone)) {
    return;
  }

  conversations.addMessage(phone, "user", text);
  const history = conversations.getRecentHistory(phone).slice(0, -1);
  const reply = await runAgent(history, text, { customerPhone: phone, notifyAdmins });
  conversations.addMessage(phone, "assistant", reply);
  await sendText(sock, jid, reply);
}

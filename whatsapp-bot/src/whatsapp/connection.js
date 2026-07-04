import path from "node:path";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import qrcodeTerminal from "qrcode-terminal";
import QRCode from "qrcode";
import pino from "pino";
import { AUTH_DIR, PROJECT_ROOT } from "../config.js";

const QR_IMAGE_PATH = path.join(PROJECT_ROOT, "qr.png");

function extractText(message) {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    null
  );
}

export function toJid(phoneOrJid) {
  return phoneOrJid.includes("@") ? phoneOrJid : `${phoneOrJid}@s.whatsapp.net`;
}

export async function sendText(sock, phoneOrJid, text) {
  await sock.sendMessage(toJid(phoneOrJid), { text });
}

export async function startWhatsApp(onMessage) {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\nScan this QR code with WhatsApp (Settings > Linked Devices > Link a Device):\n");
      qrcodeTerminal.generate(qr, { small: true });
      QRCode.toFile(QR_IMAGE_PATH, qr, { width: 400 }).catch((err) =>
        console.error("Failed to write QR image:", err)
      );
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(
        "WhatsApp connection closed.",
        shouldReconnect ? "Reconnecting..." : "Logged out — delete the auth/ folder and restart to re-pair."
      );
      if (shouldReconnect) startWhatsApp(onMessage);
    } else if (connection === "open") {
      console.log("WhatsApp connected. Bot is live.");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      const jid = msg.key.remoteJid;
      if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast") continue;

      const text = extractText(msg.message);
      if (!text) continue;

      const phone = jid.split("@")[0];
      try {
        await onMessage({ phone, jid, text, sock });
      } catch (err) {
        console.error("Error handling message:", err);
      }
    }
  });

  return sock;
}

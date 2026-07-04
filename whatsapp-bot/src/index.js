import "./db/database.js";
import { ANTHROPIC_API_KEY } from "./config.js";
import { startWhatsApp } from "./whatsapp/connection.js";
import { handleIncomingMessage } from "./whatsapp/handler.js";

if (!ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

console.log("Starting WorryQ WhatsApp bot...");
await startWhatsApp(handleIncomingMessage);

import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

const PROJECT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(PROJECT_DIR, ".env") });

function parseNumberList(value) {
  return (value || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

export const PROJECT_ROOT = PROJECT_DIR;

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5";

export const ADMIN_NUMBERS = parseNumberList(process.env.ADMIN_NUMBERS);

export const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE || 10);

export const SERVICE_AREAS = parseNumberList(process.env.SERVICE_AREAS);
export const WORKING_HOURS_START = process.env.WORKING_HOURS_START || "07:00";
export const WORKING_HOURS_END = process.env.WORKING_HOURS_END || "22:00";

export const AUTH_DIR = path.join(PROJECT_ROOT, "auth");
export const DB_PATH = process.env.DB_PATH_OVERRIDE || path.join(PROJECT_ROOT, "data", "worryq.db");
export const SERVICES_FILE = path.join(PROJECT_ROOT, "content", "services.json");
export const POLICIES_FILE = path.join(PROJECT_ROOT, "content", "policies.md");

export const MAX_HISTORY_MESSAGES = 20;

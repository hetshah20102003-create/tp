import { db } from "./database.js";
import { MAX_HISTORY_MESSAGES } from "../config.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "in_progress"];

export const customers = {
  upsert(phone, name) {
    db.prepare(
      `INSERT INTO customers (phone, name) VALUES (?, ?)
       ON CONFLICT(phone) DO UPDATE SET name = COALESCE(excluded.name, customers.name)`
    ).run(phone, name || null);
  },

  get(phone) {
    return db.prepare(`SELECT * FROM customers WHERE phone = ?`).get(phone);
  },
};

export const bookings = {
  create({ customerPhone, labourType, workersCount, location, scheduledAt, priceQuote }) {
    const insert = db.prepare(
      `INSERT INTO bookings (code, customer_phone, labour_type, workers_count, location, scheduled_at, price_quote)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    // Reserve the row first with a placeholder code, then derive a human code from its id.
    const tx = db.transaction(() => {
      const info = insert.run(
        "PENDING",
        customerPhone,
        labourType,
        workersCount,
        location,
        scheduledAt,
        priceQuote || null
      );
      const code = `WQ-${1000 + info.lastInsertRowid}`;
      db.prepare(`UPDATE bookings SET code = ? WHERE id = ?`).run(code, info.lastInsertRowid);
      return this.getById(info.lastInsertRowid);
    });
    return tx();
  },

  getById(id) {
    return db.prepare(`SELECT * FROM bookings WHERE id = ?`).get(id);
  },

  getByCode(code) {
    return db.prepare(`SELECT * FROM bookings WHERE code = ?`).get(code.toUpperCase());
  },

  listActiveForCustomer(customerPhone) {
    const placeholders = ACTIVE_BOOKING_STATUSES.map(() => "?").join(",");
    return db
      .prepare(
        `SELECT * FROM bookings WHERE customer_phone = ? AND status IN (${placeholders}) ORDER BY created_at DESC`
      )
      .all(customerPhone, ...ACTIVE_BOOKING_STATUSES);
  },

  updateStatus(code, status) {
    const result = db
      .prepare(`UPDATE bookings SET status = ? WHERE code = ?`)
      .run(status, code.toUpperCase());
    return result.changes > 0;
  },

  countToday() {
    return db
      .prepare(`SELECT COUNT(*) AS n FROM bookings WHERE date(created_at) = date('now')`)
      .get().n;
  },

  countTotal() {
    return db.prepare(`SELECT COUNT(*) AS n FROM bookings`).get().n;
  },
};

export const conversations = {
  addMessage(phone, role, content) {
    db.prepare(`INSERT INTO messages (phone, role, content) VALUES (?, ?, ?)`).run(
      phone,
      role,
      content
    );
  },

  getRecentHistory(phone, limit = MAX_HISTORY_MESSAGES) {
    const rows = db
      .prepare(
        `SELECT role, content FROM messages WHERE phone = ? ORDER BY id DESC LIMIT ?`
      )
      .all(phone, limit);
    return rows.reverse();
  },

  clearHistory(phone) {
    db.prepare(`DELETE FROM messages WHERE phone = ?`).run(phone);
  },

  countActiveChats({ sinceMinutes = 60 } = {}) {
    return db
      .prepare(
        `SELECT COUNT(DISTINCT phone) AS n FROM messages WHERE created_at >= datetime('now', ?)`
      )
      .get(`-${sinceMinutes} minutes`).n;
  },
};

export const settings = {
  get(key, fallback = null) {
    const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key);
    return row ? row.value : fallback;
  },

  set(key, value) {
    db.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run(key, String(value));
  },

  isPaused() {
    return this.get("bot_paused", "0") === "1";
  },

  setPaused(paused) {
    this.set("bot_paused", paused ? "1" : "0");
  },

  isHumanTakeover(phone) {
    return this.get(`takeover:${phone}`, "0") === "1";
  },

  setHumanTakeover(phone, active) {
    this.set(`takeover:${phone}`, active ? "1" : "0");
  },
};

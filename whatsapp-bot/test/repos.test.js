import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

process.env.DB_PATH_OVERRIDE = path.join(os.tmpdir(), `worryq-test-${Date.now()}.db`);

const { customers, bookings, conversations, settings } = await import("../src/db/repos.js");

test("customer upsert stores and updates name", () => {
  customers.upsert("911111", "Amit");
  assert.equal(customers.get("911111").name, "Amit");
  customers.upsert("911111", null);
  assert.equal(customers.get("911111").name, "Amit");
});

test("booking lifecycle: create, list active, status update, cancel", () => {
  customers.upsert("922222", "Priya");
  const booking = bookings.create({
    customerPhone: "922222",
    labourType: "helper",
    workersCount: 2,
    location: "Ahmedabad",
    scheduledAt: "tomorrow 10am",
    priceQuote: "240 INR",
  });
  assert.match(booking.code, /^WQ-\d+$/);
  assert.equal(booking.status, "pending");

  const active = bookings.listActiveForCustomer("922222");
  assert.equal(active.length, 1);
  assert.equal(active[0].code, booking.code);

  assert.equal(bookings.getByCode(booking.code).id, booking.id);

  const cancelled = bookings.updateStatus(booking.code, "cancelled");
  assert.equal(cancelled, true);
  assert.equal(bookings.listActiveForCustomer("922222").length, 0);
});

test("booking counts", () => {
  assert.ok(bookings.countTotal() >= 1);
  assert.ok(bookings.countToday() >= 1);
});

test("conversation history keeps order and can be cleared", () => {
  conversations.addMessage("933333", "user", "hi");
  conversations.addMessage("933333", "assistant", "hello");
  const history = conversations.getRecentHistory("933333");
  assert.deepEqual(
    history.map((m) => m.role),
    ["user", "assistant"]
  );
  conversations.clearHistory("933333");
  assert.equal(conversations.getRecentHistory("933333").length, 0);
});

test("settings: pause flag and per-customer takeover flag", () => {
  assert.equal(settings.isPaused(), false);
  settings.setPaused(true);
  assert.equal(settings.isPaused(), true);
  settings.setPaused(false);

  assert.equal(settings.isHumanTakeover("944444"), false);
  settings.setHumanTakeover("944444", true);
  assert.equal(settings.isHumanTakeover("944444"), true);
  settings.setHumanTakeover("944444", false);
  assert.equal(settings.isHumanTakeover("944444"), false);
});

test.after(() => {
  fs.rmSync(process.env.DB_PATH_OVERRIDE, { force: true });
  fs.rmSync(`${process.env.DB_PATH_OVERRIDE}-journal`, { force: true });
  fs.rmSync(`${process.env.DB_PATH_OVERRIDE}-wal`, { force: true });
  fs.rmSync(`${process.env.DB_PATH_OVERRIDE}-shm`, { force: true });
});

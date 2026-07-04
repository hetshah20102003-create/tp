# WorryQ WhatsApp Bot

An AI assistant that answers your customers on WhatsApp: takes bookings, tracks/cancels them,
quotes pricing & availability, explains your policies, and hands over to a real person when asked.

This guide assumes no coding background — follow it step by step.

## 1. What you need before starting

- A **spare phone number with WhatsApp installed** (not your main business number — see warning below)
- An **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com)) — this is the AI brain
- A computer that can stay switched on while the bot runs (your laptop is fine to test)
- [Node.js](https://nodejs.org) installed (version 20 or newer)

> ⚠️ **Ban risk warning**: this bot connects the same way "WhatsApp Web" does. It is not
> WhatsApp's official method for bots, so there is a small risk that number gets restricted.
> Always use a spare SIM for this, never your primary business number.

## 2. One-time setup

```bash
cd whatsapp-bot
npm install
cp .env.example .env
```

Now open `.env` in any text editor and fill in:
- `ANTHROPIC_API_KEY` — paste your key
- `ADMIN_NUMBERS` — your own WhatsApp number(s), comma-separated, no `+` or spaces (e.g. `919876543210`)

## 3. Edit your business info (no coding needed)

- `content/services.json` — list your labour types and rates
- `content/policies.md` — write your cancellation/payment/service rules in plain English

The bot only ever quotes what's in these two files — it will never invent a price or policy.

## 4. Start the bot

```bash
npm start
```

A **QR code** will print in the terminal. On the spare phone:

1. Open WhatsApp → Settings → **Linked Devices** → **Link a Device**
2. Scan the QR code shown in the terminal

Once scanned, the bot is live — anyone who messages that number gets an AI reply.
The login is remembered, so you won't need to scan again unless you delete the `auth/` folder.

## 5. Commands

**Customers** can type these, or just chat normally:
- `/menu` — see what the bot can do
- `/status` — check an existing booking
- `/cancel` — cancel a booking
- `/agent` — request a human instead of the bot
- `/reset` — start the conversation over

**You (admin numbers only)**:
- `/pause` / `/resume` — turn the whole bot off/on
- `/stats` — bookings today, total bookings, active chats
- `/takeover <number>` — silence the bot for one customer so you can reply yourself
- `/release <number>` — give that customer back to the bot

## 6. Stopping the bot

Press `Ctrl+C` in the terminal. Run `npm start` again any time to bring it back online —
it keeps your WhatsApp login and all booking data.

## What's not included yet (planned for later)

- Connecting to WorryQ's real internal database (currently uses a local file-based database)
- Live worker availability (currently answers from your configured service areas/hours)
- Payments, images, voice notes
- Moving to WhatsApp's official Business API (removes the ban risk)

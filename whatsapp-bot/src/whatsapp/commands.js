import { bookings, conversations, settings } from "../db/repos.js";

const MENU_TEXT = `*WorryQ* — labour in 30 minutes 🛠️

Just tell me what you need (e.g. "I need 2 helpers tomorrow at 10am in Ahmedabad") and I'll take care of it. Or use:

/status — check your bookings
/cancel — cancel a booking
/agent — talk to a real person
/reset — start over
/menu — show this menu`;

const ADMIN_HELP_TEXT = `*Admin commands*
/pause — pause the bot for everyone
/resume — resume the bot
/stats — booking & chat stats
/takeover <number> — silence the bot for one customer
/release <number> — give a customer back to the bot`;

function formatBooking(b) {
  return `${b.code} — ${b.labour_type} x${b.workers_count} @ ${b.location}, ${b.scheduled_at} [${b.status}]`;
}

async function handleAdminCommand(cmd, arg, { notifyAdmins }) {
  switch (cmd) {
    case "/pause":
      settings.setPaused(true);
      return "Bot paused. Customers will not get AI replies until /resume.";

    case "/resume":
      settings.setPaused(false);
      return "Bot resumed.";

    case "/stats": {
      const today = bookings.countToday();
      const total = bookings.countTotal();
      const activeChats = conversations.countActiveChats({ sinceMinutes: 60 });
      return `*Stats*\nBookings today: ${today}\nBookings total: ${total}\nActive chats (last hour): ${activeChats}\nBot paused: ${settings.isPaused() ? "yes" : "no"}`;
    }

    case "/takeover": {
      if (!arg) return "Usage: /takeover <number>";
      settings.setHumanTakeover(arg, true);
      return `Bot silenced for ${arg}. It will no longer auto-reply to them.`;
    }

    case "/release": {
      if (!arg) return "Usage: /release <number>";
      settings.setHumanTakeover(arg, false);
      return `${arg} is back with the bot.`;
    }

    case "/help":
      return ADMIN_HELP_TEXT;

    default:
      return null;
  }
}

async function handleCustomerCommand(cmd, arg, { phone, notifyAdmins }) {
  switch (cmd) {
    case "/menu":
    case "/help":
      return MENU_TEXT;

    case "/status": {
      const active = bookings.listActiveForCustomer(phone);
      if (active.length === 0) return "You have no active bookings.";
      return active.map(formatBooking).join("\n");
    }

    case "/cancel": {
      if (arg) {
        const booking = bookings.getByCode(arg);
        if (!booking || booking.customer_phone !== phone) {
          return `No booking found with code ${arg}.`;
        }
        bookings.updateStatus(arg, "cancelled");
        return `Booking ${arg} cancelled.`;
      }
      const active = bookings.listActiveForCustomer(phone);
      if (active.length === 0) return "You have no active bookings to cancel.";
      if (active.length === 1) {
        bookings.updateStatus(active[0].code, "cancelled");
        return `Booking ${active[0].code} cancelled.`;
      }
      return `You have multiple active bookings. Reply with "/cancel <code>":\n${active.map(formatBooking).join("\n")}`;
    }

    case "/agent": {
      settings.setHumanTakeover(phone, true);
      await notifyAdmins(
        `🆘 Customer ${phone} used /agent to request a human.\nReply to them directly on WhatsApp. Send "/release ${phone}" here when done.`
      );
      return "A member of our team has been notified and will reach out to you shortly.";
    }

    case "/reset":
      conversations.clearHistory(phone);
      return "Conversation reset. How can I help you?";

    default:
      return null;
  }
}

/**
 * @returns {Promise<string|null>} reply text if the message was a recognized command, else null
 */
export async function handleCommand(text, context) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) return null;

  const [cmd, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(" ").trim();
  const command = cmd.toLowerCase();

  if (context.isAdmin) {
    const adminReply = await handleAdminCommand(command, arg, context);
    if (adminReply !== null) return adminReply;
  }

  return handleCustomerCommand(command, arg, context);
}

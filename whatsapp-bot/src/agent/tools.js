import fs from "node:fs";
import {
  SERVICES_FILE,
  POLICIES_FILE,
  SERVICE_AREAS,
  WORKING_HOURS_START,
  WORKING_HOURS_END,
} from "../config.js";
import { bookings, settings } from "../db/repos.js";

function loadServices() {
  const raw = JSON.parse(fs.readFileSync(SERVICES_FILE, "utf-8"));
  return raw.services;
}

function loadPolicies() {
  return fs.readFileSync(POLICIES_FILE, "utf-8");
}

export const toolDefinitions = [
  {
    name: "get_services_and_pricing",
    description:
      "Get the list of labour types WorryQ offers with their hourly rates and minimum worker count. Use this before quoting any price.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "check_availability",
    description:
      "Check whether WorryQ can serve a given location and time. Use before confirming a booking.",
    input_schema: {
      type: "object",
      properties: {
        location: { type: "string", description: "Customer's area or address" },
        time_description: {
          type: "string",
          description: "When they want the service, in their own words (e.g. 'now', 'tomorrow 5pm')",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "create_booking",
    description:
      "Create a labour booking once the customer has confirmed the labour type, number of workers, location, and time. Returns a booking code to give the customer.",
    input_schema: {
      type: "object",
      properties: {
        labour_type: { type: "string", description: "Service id from get_services_and_pricing, e.g. 'helper'" },
        workers_count: { type: "integer", description: "Number of workers requested" },
        location: { type: "string", description: "Where the workers are needed" },
        scheduled_at: { type: "string", description: "Requested date/time in the customer's own words or ISO format" },
        price_quote: { type: "string", description: "The price you quoted the customer for this booking, as text" },
      },
      required: ["labour_type", "workers_count", "location", "scheduled_at"],
    },
  },
  {
    name: "get_booking_status",
    description:
      "Look up booking(s). Pass a booking code if the customer gave one; otherwise omit it to list the customer's own active bookings.",
    input_schema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Booking code like WQ-1042" },
      },
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel a booking by its code.",
    input_schema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Booking code like WQ-1042" },
      },
      required: ["code"],
    },
  },
  {
    name: "get_policies",
    description:
      "Get WorryQ's official policies (cancellations, payment, service areas, working hours, the 30-minute promise). Use this before answering any policy question — never invent policy details.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "escalate_to_human",
    description:
      "Hand the conversation over to a human admin. Use when the customer explicitly asks for a real person, or when you cannot help them. The bot will stop auto-replying to this customer until an admin releases them.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Brief reason for the escalation, for the admin's context" },
      },
      required: ["reason"],
    },
  },
];

export async function executeTool(name, input, context) {
  switch (name) {
    case "get_services_and_pricing": {
      const services = loadServices();
      return { services };
    }

    case "check_availability": {
      const location = (input.location || "").toLowerCase();
      const covered =
        SERVICE_AREAS.length === 0 ||
        SERVICE_AREAS.some((area) => location.includes(area.toLowerCase()));
      return {
        covered,
        working_hours: `${WORKING_HOURS_START} to ${WORKING_HOURS_END}`,
        note: covered
          ? "Location is within our service area."
          : "This location may be outside our current service area — let the customer know politely.",
      };
    }

    case "create_booking": {
      const services = loadServices();
      const service = services.find((s) => s.id === input.labour_type);
      if (!service) {
        return { error: `Unknown labour_type '${input.labour_type}'. Call get_services_and_pricing for valid ids.` };
      }
      if (input.workers_count < service.min_workers) {
        return {
          error: `${service.name} requires a minimum of ${service.min_workers} worker(s).`,
        };
      }
      const booking = bookings.create({
        customerPhone: context.customerPhone,
        labourType: service.id,
        workersCount: input.workers_count,
        location: input.location,
        scheduledAt: input.scheduled_at,
        priceQuote: input.price_quote,
      });
      return { booking };
    }

    case "get_booking_status": {
      if (input.code) {
        const booking = bookings.getByCode(input.code);
        if (!booking) return { error: `No booking found with code ${input.code}.` };
        return { booking };
      }
      const active = bookings.listActiveForCustomer(context.customerPhone);
      return { bookings: active };
    }

    case "cancel_booking": {
      const booking = bookings.getByCode(input.code);
      if (!booking) return { error: `No booking found with code ${input.code}.` };
      if (booking.customer_phone !== context.customerPhone) {
        return { error: "This booking does not belong to this customer." };
      }
      if (booking.status === "cancelled") {
        return { error: "This booking is already cancelled." };
      }
      bookings.updateStatus(input.code, "cancelled");
      return { success: true };
    }

    case "get_policies": {
      return { policies: loadPolicies() };
    }

    case "escalate_to_human": {
      settings.setHumanTakeover(context.customerPhone, true);
      if (context.notifyAdmins) {
        await context.notifyAdmins(
          `🆘 Customer ${context.customerPhone} asked for a human.\nReason: ${input.reason}\n\nReply to them directly on WhatsApp. Send "/release ${context.customerPhone}" here when done to give them back to the bot.`
        );
      }
      return {
        success: true,
        message_to_customer:
          "A member of our team has been notified and will reach out to you shortly on this chat.",
      };
    }

    default:
      return { error: `Unknown tool '${name}'` };
  }
}

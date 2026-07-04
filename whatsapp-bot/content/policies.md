<!--
  Edit this file in plain English. The bot reads it whenever a customer asks
  about policies, cancellations, payment, or how WorryQ works — it will only
  repeat what's written here, so keep it accurate and up to date.
-->

# WorryQ Policies

## The 30-Minute Promise
We aim to get a worker to your location within 30 minutes of a confirmed booking,
subject to availability in your area and normal traffic conditions.

## Service Areas
We currently operate in the areas listed in the bot's configuration
(see `SERVICE_AREAS` in `.env`). If a customer is outside these areas, let them
know we don't cover that location yet.

## Working Hours
Bookings are accepted during the hours configured in `.env`
(`WORKING_HOURS_START` to `WORKING_HOURS_END`). Outside these hours, the bot should
let the customer know we're closed and offer to book for the next available slot.

## Cancellations
- Free cancellation any time before a worker is dispatched.
- Once a worker has been dispatched (status: in_progress), cancellations may incur
  a nominal visit charge — replace this line with your real policy.

## Payment
- Payment is collected directly by the worker in cash, or via UPI, after the job
  is completed — replace this with your real payment policy.

## Changing a Booking
Customers should cancel and rebook if they need to change the date, time, or
number of workers.

## Escalation
If a customer wants to speak to a real person, the bot will stop responding to
them and notify an admin. An admin should follow up directly on WhatsApp.

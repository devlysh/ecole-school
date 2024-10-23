import Stripe from "stripe";
import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import { handlePriceUpdated } from "./price.updated";
import { handleCustomerUpdated } from "./customer.updated";
import { handleInvoicePaymentSucceeded } from "./invoice.payment_succeeded";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SIGNING_SECRET = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing!");
}

if (!STRIPE_WEBHOOK_SIGNING_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SIGNING_SECRET is missing!");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

export const POST = async (request: NextRequest) => {
  logger.info("Webhook received");

  if (!STRIPE_WEBHOOK_SIGNING_SECRET) {
    logger.error("STRIPE_WEBHOOK_SIGNING_SECRET is missing");
    return new Response(
      JSON.stringify({ error: "Webhook signing secret missing" }),
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    logger.error("Webhook signature missing");
    return new Response(
      JSON.stringify({ error: "Webhook signature missing" }),
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SIGNING_SECRET
    );
    logger.info({ eventType: event.type }, "Received Stripe webhook event");
  } catch (err: unknown) {
    logger.error({ err }, "Webhook signature verification failed");
    return new Response(
      JSON.stringify({ error: "Webhook signature verification failed" }),
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "customer.updated": {
        const customerUpdated = event.data.object;
        logger.debug({ customerUpdated }, "Customer updated event received");
        await handleCustomerUpdated(customerUpdated);
        break;
      }
      case "price.updated": {
        const price = event.data.object;
        logger.debug({ price }, "Price updated event received");
        await handlePriceUpdated(price);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoicePaymentSucceeded = event.data.object;
        logger.debug(
          { invoicePaymentSucceeded },
          "Invoice payment succeeded event received"
        );
        await handleInvoicePaymentSucceeded(invoicePaymentSucceeded);
        break;
      }
      default: {
        logger.info({ eventType: event.type }, "Unhandled event type");
      }
    }

    logger.info({ eventType: event.type }, "Webhook processed successfully");
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: unknown) {
    logger.error(
      { err, eventType: event.type },
      "Error processing webhook event"
    );
    return new Response(
      JSON.stringify({ error: "Error processing webhook event" }),
      { status: 500 }
    );
  }
};

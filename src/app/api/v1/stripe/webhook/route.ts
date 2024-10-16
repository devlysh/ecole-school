import Stripe from "stripe";
import { NextRequest } from "next/server";
import logger from "@/lib/logger";

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

export async function POST(request: NextRequest) {
  if (!STRIPE_WEBHOOK_SIGNING_SECRET) {
    console.error("STRIPE_WEBHOOK_SIGNING_SECRET is missing");
    return new Response(
      JSON.stringify({ error: "Webhook signing secret missing" }),
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
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
  } catch (err: unknown) {
    logger.error(err, "Webhook error");
    return new Response(JSON.stringify({ err }), { status: 500 });
  }

  switch (event.type) {
    case "customer.created": {
      const customerCreated = event.data.object;
      logger.info({ customerCreated }, "TODO");
      return Response.json(null, { status: 200 });
    }

    case "customer.updated": {
      const customerUpdated = event.data.object;
      logger.info({ customerUpdated }, "TODO");
      return Response.json(null, { status: 200 });
    }

    case "price.updated": {
      const priceUpdated = event.data.object;
      logger.info({ priceUpdated }, "TODO");
      return Response.json(null, { status: 200 });
    }

    case "invoice.payment_succeeded": {
      const invoicePaymentSucceeded = event.data.object;
      logger.info({ invoicePaymentSucceeded }, "TODO");
      return Response.json(null, { status: 200 });
    }

    default: {
      const object = event.data.object;
      logger.info({ type: event.type, data: object });
      return Response.json(null, { status: 200 });
    }
  }
}

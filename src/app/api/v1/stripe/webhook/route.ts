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
    case "charge.succeeded": {
      const chargeSucceeded = event.data.object;
      logger.info("Invoice payment succeeded:", chargeSucceeded);
      return Response.json("Success!", { status: 200 });
    }
    case "customer.created": {
      const customerCreated = event.data.object;
      logger.info("Invoice payment succeeded:", customerCreated);
      return Response.json("Success!", { status: 200 });
    }
    case "customer.updated": {
      const customerUpdated = event.data.object;
      logger.info("Invoice payment succeeded:", customerUpdated);
      return Response.json("Success!", { status: 200 });
    }
    case "invoice.created": {
      const invoiceCreated = event.data.object;
      logger.info("Invoice payment succeeded:", invoiceCreated);
      return Response.json("Success!", { status: 200 });
    }

    case "invoice.finalized": {
      const invoiceFinalized = event.data.object;
      logger.info("Invoice payment succeeded:", invoiceFinalized);
      return Response.json("Success!", { status: 200 });
    }
    case "invoice.paid": {
      const invoicePaid = event.data.object;
      logger.info("Invoice payment succeeded:", invoicePaid);
      return Response.json("Success!", { status: 200 });
    }
    case "invoice.payment_succeeded": {
      const invoicePaymentSucceeded = event.data.object as Stripe.Invoice;
      logger.info("Invoice payment succeeded:", invoicePaymentSucceeded);
      return Response.json("Success!", { status: 200 });
    }
    case "invoice.updated": {
      const invoiceUpdated = event.data.object;
      logger.info("Invoice payment succeeded:", invoiceUpdated);
      return Response.json("Success!", { status: 200 });
    }
    case "invoiceitem.created": {
      const invoiceitemCreated = event.data.object;
      logger.info("Invoice payment succeeded:", invoiceitemCreated);
      return Response.json("Success!", { status: 200 });
    }
    case "payment_intent.created": {
      const paymentIntentCreated = event.data.object;
      logger.info("Invoice payment succeeded:", paymentIntentCreated);
      return Response.json("Success!", { status: 200 });
    }
    case "payment_intent.succeeded": {
      const paymentIntentSucceeded = event.data.object;
      logger.info("Invoice payment succeeded:", paymentIntentSucceeded);
      return Response.json("Success!", { status: 200 });
    }
    case "payment_method.attached": {
      const paymentMethodAttached = event.data.object;
      logger.info("Invoice payment succeeded:", paymentMethodAttached);
      return Response.json("Success!", { status: 200 });
    }
    default: {
      logger.info(`Unhandled event type ${event.type}`);
      return Response.json("Success!", { status: 200 });
    }
  }
}

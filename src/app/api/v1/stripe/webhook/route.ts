import Stripe from "stripe";
import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import { handlePriceUpdated } from "./price.updated";
import { handleCustomerUpdated } from "./customer.updated";

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
    case "customer.updated": {
      const customerUpdated = event.data.object;
      logger.debug({ customerUpdated }, "Customer updated event received");
      try {
        await handleCustomerUpdated(customerUpdated);
        return Response.json(null, { status: 200 });
      } catch (err: unknown) {
        if (err instanceof Error) {
          logger.error({ err: err.message }, "Error handling customer update");
          if (err.message.includes("Unknown argument `stripeCustomerId`")) {
            return Response.json(
              {
                error:
                  "Prisma schema mismatch: stripeCustomerId field is missing",
              },
              { status: 500 }
            );
          }
        } else {
          logger.error({ err }, "Unknown error handling customer update");
        }
        return Response.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    }

    case "price.updated": {
      const price = event.data.object;
      logger.debug({ price }, "price.updated");
      try {
        await handlePriceUpdated(price);
        return Response.json(null, { status: 200 });
      } catch (err: unknown) {
        logger.error(err, "Failed to handle price update");
        return Response.json(err, { status: 500 });
      }
    }

    case "invoice.payment_succeeded": {
      //
      const invoicePaymentSucceeded = event.data.object;
      logger.debug({ invoicePaymentSucceeded }, "TODO");
      return Response.json(null, { status: 200 });
    }

    default: {
      // TODO: Handle other events
      // const object = event.data.object;
      // logger.debug({ type: event.type, data: object });
      return Response.json(null, { status: 200 });
    }
  }
};

import logger from "@/lib/logger";
import { Plan } from "@/lib/types";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const GET = async () => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      limit: 20,
    });

    const plans: Plan[] = prices.data.map((price) => ({
      id: price.id,
      name: price.nickname as string,
      product: price.product as string,
      amount: Number(price.unit_amount),
      currency: price.currency,
      metadata: {
        credits: Number(price.metadata.credits),
        ...(price.metadata.discount && {
          discount: Number(price.metadata.discount),
        }),
      },
    }));

    return Response.json(plans);
  } catch (err: unknown) {
    logger.error(err, "Error fetching plans");
    return Response.json("Failed to load subscription plans", { status: 500 });
  }
};

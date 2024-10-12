import logger from "@/lib/logger";
import { Plan } from "@/lib/types";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

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
        numberOfClasses: Number(price.metadata.numberOfClasses),
        ...(price.metadata.discount && {
          discount: Number(price.metadata.discount),
        }),
      },
    }));

    return Response.json(plans);
  } catch (error) {
    logger.error("Error fetching plans:", error);
    return Response.json("Failed to load subscription plans", { status: 500 });
  }
};

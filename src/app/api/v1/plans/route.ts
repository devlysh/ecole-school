import { Plan } from "@/lib/types";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const GET = async () => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      limit: 20,
      expand: ["data"],
    });

    const plans: Plan[] = prices.data.map((price) => ({
      id: price.id,
      name: price.nickname as string,
      product: price.product as string,
      amount: price.unit_amount as number,
      currency: price.currency,
    }));

    return Response.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return Response.json("Failed to load subscription plans", { status: 500 });
  }
};

import Stripe from "stripe";
import { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();

    // Cancel the subscription immediately
    const canceledSubscription =
      await stripe.subscriptions.cancel(subscriptionId);

    return Response.json({ canceledSubscription });
  } catch (err: unknown) {
    console.error("Error canceling subscription:", err);
    return Response.json(err, { status: 400 });
  }
}

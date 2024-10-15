import Stripe from "stripe";
import { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();

    // Reactivate the subscription
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    return Response.json({ updatedSubscription });
  } catch (err: unknown) {
    console.error("Error reactivating subscription:", err);
    return Response.json(err, { status: 400 });
  }
}

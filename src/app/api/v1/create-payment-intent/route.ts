import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-09-30.acacia",
});

export async function POST(request: Request) {
  try {
    const { email, planId } = await request.json();
    console.log("Received payment intent request:", { email, planId });

    if (!email || !planId) {
      console.warn("Missing parameters:", { email, planId });
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    const price = await stripe.prices.retrieve(planId);
    console.log("Retrieved price from Stripe:", price);

    if (!price) {
      console.warn("Plan not found for planId:", planId);
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount || 0,
      currency: price.currency,
      receipt_email: email,
      metadata: {
        plan_id: planId,
      },
    });

    console.log("Created PaymentIntent:", paymentIntent.id);

    return NextResponse.json(
      { clientSecret: paymentIntent.client_secret },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Error creating PaymentIntent:", err);
    return NextResponse.json(err, { status: 500 });
  }
}

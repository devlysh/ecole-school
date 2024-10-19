import Stripe from "stripe";
import { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { email, planId, paymentMethodId } = await request.json();

    // 1. Create or retrieve the customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }

    // 2. Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // 3. Set the default payment method on the customer
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 4. Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    const clientSecret =
      typeof subscription.latest_invoice === "object" &&
      subscription.latest_invoice?.payment_intent &&
      typeof subscription.latest_invoice.payment_intent === "object" &&
      "client_secret" in subscription.latest_invoice.payment_intent
        ? subscription.latest_invoice.payment_intent.client_secret
        : null;

    if (!clientSecret) {
      console.error("Failed to obtain client secret from Stripe");
      return Response.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }

    return Response.json({ clientSecret });
  } catch (err: unknown) {
    console.error("Error creating subscription:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

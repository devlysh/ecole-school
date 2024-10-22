import Stripe from "stripe";
import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import { CreateSubscriptionRequest } from "./request";
import { cookies } from "next/headers";
import { IntroTokenPayload } from "@/lib/types";
import { signToken, verifyToken } from "@/lib/jwt";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in the environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

export const POST = async (request: NextRequest) => {
  try {
    const { email, planId, paymentMethodId } =
      (await request.json()) as CreateSubscriptionRequest;

    const customer = await getOrCreateCustomer(email);
    await setupCustomerPaymentMethod(customer.id, paymentMethodId);
    const subscription = await createSubscription(customer.id, planId);

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    const clientSecret = paymentIntent?.client_secret;
    const subscriptionId = subscription.id;

    if (!clientSecret) {
      logger.error("Failed to obtain client secret from Stripe");

      return Response.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }

    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return Response.json({ error: "Token is missing" }, { status: 400 });
    }

    const decodedToken = (await verifyToken(token.value)) as IntroTokenPayload;

    const tokenData = {
      email: decodedToken.email,
      name: decodedToken.name,
    };

    const registrationToken = signToken(tokenData);

    cookieStore.set("registrationToken", registrationToken, {
      maxAge: 60 * 5, // 5 minutes
    });

    return Response.json({
      clientSecret,
      subscriptionId,
    });
  } catch (err: unknown) {
    logger.error({ err }, "Error creating subscription");
    if (err instanceof Stripe.errors.StripeError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
};

const getOrCreateCustomer = async (email: string): Promise<Stripe.Customer> => {
  const existingCustomers = await stripe.customers.list({ email });
  if (existingCustomers.data.length) {
    return existingCustomers.data[0];
  }
  return await stripe.customers.create({ email });
};

const setupCustomerPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<void> => {
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
};

const createSubscription = async (
  customerId: string,
  planId: string
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: planId }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
};

import Stripe from "stripe";
import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import { CreateSubscriptionRequest } from "./request";
import { cookies } from "next/headers";
import {
  PreAuthTokenPayload,
  RegistrationTokenPayload,
  TokenType,
} from "@/lib/types";
import { signToken, verifyAccessToken, verifyToken } from "@/lib/jwt";
import { handleErrorResponse } from "@/lib/errorUtils";
import {
  EmailIsMissingError,
  UnauthorizedError,
  UserNotFoundError,
} from "@/lib/errors";
import { UserRepository } from "@domain/repositories/User.repository";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in the environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

export const GET = async () => {
  try {
    const { email } = await verifyAccessToken();

    if (!email) {
      throw new EmailIsMissingError();
    }

    const customers = await stripe.customers.list({
      email,
    });

    if (!customers.data.length) {
      throw new UserNotFoundError("Stripe customer not found", { email });
    }

    const customerId = customers.data[0].id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
    });

    const subscription = subscriptions.data[0];
    const paymentMethod = paymentMethods.data[0];

    const subscriptionDetails = {
      planName: subscription.items.data[0].plan.nickname,
      paymentMethodCardLast4: paymentMethod.card?.last4,
    };
    return Response.json(subscriptionDetails, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error getting subscription details");
    return handleErrorResponse(
      new Error("Failed to get subscription details"),
      500
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const { email, name, planId, paymentMethodId } =
      (await request.json()) as CreateSubscriptionRequest;

    const cookieStore = cookies();
    const preAuthToken = cookieStore.get(TokenType.PRE_AUTH);

    if (!preAuthToken) {
      throw new UnauthorizedError("Token is missing");
    }

    const decodedPreAuthToken = (await verifyToken(
      preAuthToken.value
    )) as unknown as PreAuthTokenPayload;

    if (!name) {
      throw new UnauthorizedError("Name is missing");
    }

    if (!email) {
      throw new UnauthorizedError("Email is missing");
    }

    if (!decodedPreAuthToken.language) {
      throw new UnauthorizedError("Language is missing");
    }

    if (!decodedPreAuthToken.quizAnswers) {
      throw new UnauthorizedError("Quiz answers are missing");
    }

    const customer = await getOrCreateCustomer(
      email,
      name,
      decodedPreAuthToken.language,
      decodedPreAuthToken.quizAnswers
    );
    await setupStripeCustomerPaymentMethod(customer.id, paymentMethodId);
    const subscription = await createStripeSubscription(customer.id, planId);

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    const clientSecret = paymentIntent?.client_secret;
    const subscriptionId = subscription.id;

    if (!clientSecret) {
      logger.error("Failed to obtain client secret from Stripe");
      throw new UnauthorizedError("Failed to obtain client secret from Stripe");
    }

    const registrationTokenData: RegistrationTokenPayload = {
      email: decodedPreAuthToken.email,
    };

    const registrationToken = await signToken(registrationTokenData, "5m");

    cookieStore.set(TokenType.REGISTRATION, registrationToken, {
      maxAge: 60 * 5, // 5 minutes
    });

    return Response.json(
      {
        clientSecret,
        subscriptionId,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    logger.error(err, "Error creating subscription");
    if (err instanceof Stripe.errors.StripeError) {
      return handleErrorResponse(err, 400);
    } else if (err instanceof UnauthorizedError) {
      return handleErrorResponse(err, 401);
    }
    return handleErrorResponse(new Error("An unexpected error occurred"), 500);
  }
};

const getOrCreateCustomer = async (
  email: string,
  name: string,
  language: string,
  quizAnswers: Record<string, string>
): Promise<Stripe.Customer> => {
  const existingCustomers = await stripe.customers.list({ email });
  let stripeCustomer: Stripe.Customer;

  if (existingCustomers.data.length) {
    stripeCustomer = existingCustomers.data[0];
  } else {
    stripeCustomer = await stripe.customers.create({ email });
  }

  const userRepository = new UserRepository();

  await userRepository.upsertStudent(
    email,
    name,
    stripeCustomer,
    language,
    quizAnswers
  );

  return stripeCustomer;
};

const setupStripeCustomerPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<void> => {
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
};

const createStripeSubscription = async (
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

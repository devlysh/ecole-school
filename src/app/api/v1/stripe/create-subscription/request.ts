import logger from "@/lib/logger";

export interface CreateSubscriptionRequest {
  email: string;
  planId: string;
  paymentMethodId: string;
}

export const createSubscription = async (
  email: string,
  planId: string,
  paymentMethodId: string
): Promise<{ clientSecret: string }> => {
  const response = await fetch("/api/v1/stripe/create-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      planId,
      paymentMethodId,
    } as CreateSubscriptionRequest),
  });

  if (!response.ok) {
    logger.error({ response }, "Error during create subscription");
    throw new Error(
      response.statusText ?? "An error occurred while processing your payment."
    );
  }

  const { clientSecret } = await response.json();

  return { clientSecret };
};

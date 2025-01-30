const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export interface CreateSubscriptionRequest {
  email: string;
  name: string;
  planId: string;
  paymentMethodId: string;
}

export const getSubscriptionDetailsRequest = async () => {
  const response = await fetch(
    `${NEXT_PUBLIC_BASE_URL}/api/v1/stripe/subscriptions`
  );

  if (!response.ok) {
    throw new Error(
      response.statusText ??
        "An error occurred while fetching your subscription details."
    );
  }

  return await response.json();
};

export const createSubscriptionRequest = async (
  email: string,
  name: string,
  planId: string,
  paymentMethodId: string
): Promise<{ clientSecret: string }> => {
  const response = await fetch(
    `${NEXT_PUBLIC_BASE_URL}/api/v1/stripe/subscriptions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        planId,
        paymentMethodId,
      } as CreateSubscriptionRequest),
    }
  );

  if (!response.ok) {
    throw new Error(
      response.statusText ?? "An error occurred while processing your payment."
    );
  }

  return await response.json();
};

import { getSubscriptionDetailsRequest } from "@/app/api/v1/stripe/subscriptions/request";
import { useEffect, useState } from "react";

interface SubscriptionDetails {
  planName: string;
  paymentMethodCardLast4: string;
}

export const useSubscriptionDetails = () => {
  const [subscriptionDetails, setSubscriptionDetails] =
    useState<SubscriptionDetails | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      setLoading(true);
      try {
        const subscriptionDetails = await getSubscriptionDetailsRequest();
        setSubscriptionDetails(subscriptionDetails);
      } catch (err: unknown) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, []);

  return { subscriptionDetails, error, loading };
};

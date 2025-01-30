import useLanguages from "@/hooks/useLanguages";
import { useSubscriptionDetails } from "@/hooks/useSubscriptionDetails";
import React from "react";

interface SubscriptionDetailsProps {
  language: string;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  language,
}) => {
  const { languages } = useLanguages();
  const { subscriptionDetails } = useSubscriptionDetails();

  return (
    <div>
      <p>Language: {languages.find((l) => l.code === language)?.name}</p>
      {subscriptionDetails?.planName && (
        <p>Current Plan: {subscriptionDetails?.planName}</p>
      )}
      {subscriptionDetails?.paymentMethodCardLast4 && (
        <p>
          Payment Method: **** **** ****{" "}
          {subscriptionDetails?.paymentMethodCardLast4}
        </p>
      )}
    </div>
  );
};

export default SubscriptionDetails;

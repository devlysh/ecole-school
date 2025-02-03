import useLanguages from "@/hooks/useLanguages";
import { useSubscriptionDetails } from "@/hooks/useSubscriptionDetails";
import React from "react";

interface SubscriptionDetailsProps {
  languages: string[];
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  languages,
}) => {
  const { languages: languagesList } = useLanguages();
  const { subscriptionDetails } = useSubscriptionDetails();

  return (
    <div>
      <p>
        Language:{" "}
        {languages
          .map(
            (language) => languagesList.find((l) => l.code === language)?.name
          )
          .join(", ")}
      </p>
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

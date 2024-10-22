import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Plan } from "@/lib/types";
import logger from "@/lib/logger";
import { createSubscriptionRequest } from "@/app/api/v1/stripe/create-subscription/request";

interface CheckoutFormProps {
  email: string;
  selectedPrice: Plan;
  onSuccessfulPayment: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  email,
  selectedPrice,
  onSuccessfulPayment,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [nameOnCard, setNameOnCard] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardElementReady, setCardElementReady] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create the payment method
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: paymentMethodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement!,
          billing_details: {
            name: nameOnCard,
            email: email,
          },
        });

      if (paymentMethodError) {
        setError(paymentMethodError.message ?? "An unknown error occurred.");
        setLoading(false);
        return;
      }

      const paymentMethodId = paymentMethod?.id;

      // Step 2: Send payment method ID to the server to create a subscription
      try {
        const { clientSecret } = await createSubscriptionRequest(
          email,
          selectedPrice.id,
          paymentMethodId
        );

        // Step 3: Confirm payment
        const { error: confirmError } =
          await stripe.confirmCardPayment(clientSecret);

        if (confirmError) {
          setError(
            confirmError.message ??
              "An error occurred while confirming your payment."
          );
          setLoading(false);
          return;
        }

        // Payment successful
        onSuccessfulPayment();
      } catch (err) {
        logger.error({ err }, "Error during create subscription");
        setError("An error occurred while processing your payment.");
        setLoading(false);
        return;
      }
    } catch (err: unknown) {
      logger.error({ err }, "Error during checkout");
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${cardElementReady ? "" : "opacity-0"} space-y-4 transition-opacity duration-1000 ease-in-out`}
    >
      <Input
        type="text"
        placeholder="Name on card"
        value={nameOnCard}
        onChange={(e) => setNameOnCard(e.target.value)}
        className="w-full"
      />
      <CardElement
        className="p-3 border rounded-lg"
        onReady={() => setCardElementReady(true)}
      />
      {error && <p className="text-red-500">{error}</p>}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        isDisabled
        className="w-full"
      />
      <Button
        disabled={!stripe || loading}
        className="w-full p-3 bg-primary text-white rounded-lg font-bold text-lg"
        type="submit"
      >
        {loading ? "Processing..." : "Pay"}
      </Button>
    </form>
  );
};

export default CheckoutForm;

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { Input } from "@nextui-org/input";
import Cookies from "js-cookie";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Plan } from "@/lib/types";

interface CheckoutFormProps {
  email: string;
  selectedPrice: Plan;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  email,
  selectedPrice,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [nameOnCard, setNameOnCard] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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

      Cookies.set("email", email);
      const paymentMethodId = paymentMethod?.id;

      // Step 2: Send payment method ID to the server to create a subscription
      const res = await fetch("/api/v1/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          planId: selectedPrice?.id,
          paymentMethodId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "An error occurred while processing your payment."
        );
        setLoading(false);
        return;
      }

      const { clientSecret } = data;

      if (!clientSecret) {
        console.error("Client secret is missing from the server response");
        setError(
          "An error occurred while processing your payment. Please try again."
        );
        setLoading(false);
        return;
      }

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
      router.push("/account");
    } catch (err: unknown) {
      console.error("Error during checkout:", err);
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
"use client";

import React, { useState, useEffect } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@nextui-org/button";
import { getStripePromise } from "@/lib/stripe";
import logger from "@/lib/logger";
import { Language, Plan } from "@/lib/types";
import { Spinner } from "@nextui-org/spinner";
import useLanguages from "@/hooks/useLanguages";
import { useRouter } from "next/navigation";
import { Input } from "@nextui-org/input";

const CheckoutForm = ({
  email,
  setEmail,
  selectedPrice,
}: {
  email: string;
  setEmail: (email: string) => void;
  selectedPrice: Plan;
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
        setError(paymentMethodError.message || "An unknown error occurred.");
        setLoading(false);
        return;
      }

      localStorage.setItem("email", email);
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

      const { clientSecret, error } = await res.json();

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      // Step 3: Confirm payment if the payment intent hasn't succeeded yet
      const { paymentIntent } =
        await stripe.retrievePaymentIntent(clientSecret);
      if (paymentIntent?.status === "succeeded") {
        router.push("/account");
        return;
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (result.error) {
        setError(result.error.message || "An unknown error occurred.");
      } else if (result.paymentIntent?.status === "succeeded") {
        router.push("/account");
      }
    } catch (err: unknown) {
      console.error("Error during checkout:", err);
      setError("An unexpected error occurred");
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
        onChange={(e) => setEmail(e.target.value)}
        className="w-full"
      />
      <Button
        disabled={!stripe || loading}
        className="w-full p-3 bg-primary text-white rounded-lg font-bold text-lg"
        type="submit"
      >
        {loading ? "Processing..." : "Continue"}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { languages, languagesLoading, languagesError } = useLanguages();

  if (languagesError) {
    throw new Error("Failed to load languages");
  }

  const [language, setLanguage] = useState<Language["code"]>();
  const [selectedPrice, setSelectedPrice] = useState<Plan>();

  useEffect(() => {
    try {
      const rawLanguage = localStorage.getItem("language");
      const rawSelectedPrice = localStorage.getItem("selectedPrice");
      if (!rawLanguage || !rawSelectedPrice) {
        router.push("/pricing");
      }
      if (rawLanguage) {
        setLanguage(rawLanguage);
      }

      if (rawSelectedPrice) {
        setSelectedPrice(JSON.parse(rawSelectedPrice));
      }

      const e = localStorage.getItem("email");
      if (!e) {
        router.push("/quiz");
        return;
      }
      setEmail(e);
    } catch (e) {
      logger.error("Failed to parse quiz answers from localStorage", e);
    }
  }, [router]);

  return (
    <Elements stripe={getStripePromise()}>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Complete your purchase</h2>
          {selectedPrice ? (
            <CheckoutForm
              email={email}
              setEmail={setEmail}
              selectedPrice={selectedPrice}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <Spinner size="sm" />
            </div>
          )}
        </div>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Summary</h2>
          <div className="space-y-4 text-gray-700">
            {languagesLoading ? (
              <div className="w-full text-center">
                <Spinner size="sm" />
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Language</span>
                <span>{languages.find((l) => l.code === language)?.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Duration</span>
              <span>4 weeks</span>
            </div>
            <div className="flex justify-between">
              {selectedPrice ? (
                <>
                  <span>Class credits</span>
                  <span>
                    {selectedPrice.metadata.numberOfClasses} private class
                    credits
                  </span>
                </>
              ) : (
                <div className="w-full text-center">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <span>Payment</span>
              <span>Recurring, 4 weeks</span>
            </div>
            {selectedPrice ? (
              <div className="flex justify-between text-2xl font-bold mt-6">
                <span>Price</span>
                <span>
                  {(selectedPrice.amount / 100).toFixed(2)}{" "}
                  {selectedPrice.currency.toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="w-full text-center">
                <Spinner size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default Checkout;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePromise } from "@/lib/stripe";
import { Spinner } from "@nextui-org/spinner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

import { submitCheckoutRequest } from "@/app/api/v1/checkout/submit/request";
import logger from "@/lib/logger";
import { PreAuthTokenPayload, Language, Plan, TokenType } from "@/lib/types";
import CheckoutForm from "./CheckoutForm";

interface CheckoutProps {
  email: string;
  name: string;
  selectedPrice: Plan;
  languages: Language[];
}

const Checkout = ({ email, name, selectedPrice, languages }: CheckoutProps) => {
  const router = useRouter();
  const [language, setLanguage] = useState<Language["code"]>();

  const handleSuccessfulPayment = useCallback(async () => {
    await submitCheckoutRequest();

    const registrationToken = Cookies.get(TokenType.REGISTRATION);

    Cookies.remove(TokenType.REGISTRATION);
    Cookies.remove(TokenType.PRE_AUTH);

    if (!registrationToken) {
      return;
    }

    router.push(`/set-password?token=${registrationToken}`);
  }, [router]);

  useEffect(() => {
    try {
      const preAuthToken = Cookies.get(TokenType.PRE_AUTH);

      if (!preAuthToken) {
        return;
      }

      const decodedPreAuthToken = jwt.decode(
        preAuthToken
      ) as PreAuthTokenPayload;

      if (
        !decodedPreAuthToken ||
        !decodedPreAuthToken.language ||
        !decodedPreAuthToken.selectedPrice ||
        !decodedPreAuthToken.email ||
        !decodedPreAuthToken.name
      ) {
        router.push("/pricing");
        return;
      }

      setLanguage(decodedPreAuthToken.language);
    } catch (err) {
      logger.error(err, "Failed to parse checkout data from cookies");
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
              name={name}
              selectedPrice={selectedPrice}
              onSuccessfulPayment={handleSuccessfulPayment}
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
            {
              <div className="flex justify-between">
                <span>Language</span>
                <span>{languages.find((l) => l.code === language)?.name}</span>
              </div>
            }
            <div className="flex justify-between">
              <span>Duration</span>
              <span>4 weeks</span>
            </div>
            <div className="flex justify-between">
              {selectedPrice ? (
                <>
                  <span>Class credits</span>
                  <span>
                    {selectedPrice.metadata.credits} private class credits
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

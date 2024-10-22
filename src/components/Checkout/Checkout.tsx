"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePromise } from "@/lib/stripe";
import { Spinner } from "@nextui-org/spinner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

import { submitCheckoutRequest } from "@/app/api/v1/submit-checkout/request";
import logger from "@/lib/logger";
import { IntroTokenPayload, Language, Plan } from "@/lib/types";
import CheckoutForm from "./CheckoutForm";

const Checkout = ({ languages }: { languages: Language[] }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<Language["code"]>();
  const [selectedPrice, setSelectedPrice] = useState<Plan>();

  const handleSuccessfulPayment = useCallback(async () => {
    await submitCheckoutRequest();

    const token = Cookies.get("registrationToken");

    Cookies.remove("registrationToken");

    if (!token) {
      return;
    }

    router.push(`/set-password?token=${token}`);
  }, [router]);

  useEffect(() => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        return;
      }

      const payload = jwt.decode(token) as IntroTokenPayload;

      if (
        !payload ||
        !payload.language ||
        !payload.selectedPrice ||
        !payload.email
      ) {
        return;
      }

      setLanguage(payload.language);
      setSelectedPrice(JSON.parse(payload.selectedPrice));
      setEmail(payload.email);
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

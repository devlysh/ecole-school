"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripePromise } from "@/lib/stripe";
import { Spinner } from "@nextui-org/spinner";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import useLanguages from "@/hooks/useLanguages";
import logger from "@/lib/logger";
import { Language, Plan } from "@/lib/types";
import CheckoutForm from "./CheckoutForm";

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
      const rawLanguage = Cookies.get("language");
      const rawSelectedPrice = Cookies.get("selectedPrice");

      if (!rawLanguage || !rawSelectedPrice) {
        router.push("/pricing");
      }
      if (rawLanguage) {
        setLanguage(rawLanguage);
      }

      if (rawSelectedPrice) {
        setSelectedPrice(JSON.parse(rawSelectedPrice));
      }

      const e = Cookies.get("email");
      if (!e) {
        router.push("/quiz");
        return;
      }
      setEmail(e);
    } catch (err) {
      logger.error(err, "Failed to parse quiz answers from localStorage");
    }
  }, [router]);

  return (
    <Elements stripe={getStripePromise()}>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Complete your purchase</h2>
          {selectedPrice ? (
            <CheckoutForm email={email} selectedPrice={selectedPrice} />
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

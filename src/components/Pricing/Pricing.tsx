"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { SubscriptionPlan } from "./SubscriptionPlan";
import { groupByCurrency } from "@/lib/utils";
import { PreAuthTokenPayload, Currency, Plan, TokenType } from "@/lib/types";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import LanguageSelect from "./LanguageSelect";
import CurrencySelect from "./CurrencySelect";
import logger from "@/lib/logger";
import jwt from "jsonwebtoken";
import { submitPlanRequest } from "@/app/api/v1/plans/request";
import { toast } from "react-toastify";
import { Language } from "@prisma/client";

const Pricing = ({
  languages,
  currencies,
  plans,
}: {
  languages: Language[];
  currencies: Currency[];
  plans: Plan[];
}) => {
  const router = useRouter();

  const defaultSelectedPrice = plans.find(
    (plan) => plan.currency === "usd" && plan.metadata.credits === 12
  );

  const [selectedPriceId, setSelectedPriceId] = useState<string>(
    defaultSelectedPrice?.id ?? ""
  );
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language["code"]>("en");
  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency["code"]>("USD");

  useEffect(() => {
    try {
      const preAuthToken = Cookies.get(TokenType.PRE_AUTH);

      if (!preAuthToken) {
        return;
      }

      const payload = jwt.decode(preAuthToken) as PreAuthTokenPayload;

      if (!payload) {
        return;
      }

      if (payload.language) setSelectedLanguage(payload.language);
      if (payload.currency) setSelectedCurrency(payload.currency);
      if (payload.selectedPrice) {
        const priceId = JSON.parse(payload.selectedPrice).id;
        setSelectedPriceId(priceId);
      }
    } catch (err: unknown) {
      logger.error(err, "Failed to parse pricing data from cookies");
    }
  }, [router]);

  const plansByCurrency = useMemo(() => {
    const map = groupByCurrency(plans);
    const filteredPlans = map.get(selectedCurrency.toLowerCase()) ?? [];
    return filteredPlans.sort((a, b) => a.amount - b.amount);
  }, [plans, selectedCurrency]);

  const handleLanguageChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedLanguage(event.target.value);
    },
    []
  );

  const handleCurrencyChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedCurrency(event.target.value);
    },
    []
  );

  const handleSubscriptionPlanClick = useCallback((id: string) => {
    setSelectedPriceId(id);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedPriceId) {
      throw new Error("Selected plan ID should be defined");
    }

    Cookies.set("language", selectedLanguage);
    Cookies.set("currency", selectedCurrency);
    Cookies.set(
      "selectedPrice",
      JSON.stringify(plans.find((plan) => plan.id === selectedPriceId))
    );

    try {
      await submitPlanRequest();
      router.push("/checkout");
    } catch (err: unknown) {
      toast.error("Failed to submit plan");
      logger.error(err, "Error during plan submission");
    }
  }, [plans, router, selectedCurrency, selectedLanguage, selectedPriceId]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="">
        <div className="text-lg">
          Get ready for flexible and convenient language learning
        </div>
        <h1 className="text-5xl font-extrabold my-8">Choose your plan</h1>
        <div className="text-base my-8">
          You can change your plan at any time
        </div>
        <div className="flex justify-between my-8">
          <div className="w-1/2">
            <LanguageSelect
              languages={languages}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
          <div className="w-1/3">
            <CurrencySelect
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
            />
          </div>
        </div>
        <div className="text-3xl my-8">What do you get?</div>
        <ul className="list-disc list-inside">
          <li>60-minute live classes</li>
          <li>C1-C2 level teachers</li>
          <li>Available on Zoom 24/7</li>
          <li>Individual program</li>
        </ul>
      </div>
      <div className="">
        <div className="text-2xl">Recurring number of classes:</div>
        <div className="text-base my-8">Total changes every 4 weeks</div>
        <div className="flex flex-col">
          {!plans.length ? (
            <div className="w-full text-center">
              <Spinner size="sm" color="secondary" />
            </div>
          ) : (
            <>
              {plansByCurrency.map((plan) => (
                <SubscriptionPlan
                  id={plan.id}
                  key={plan.name}
                  name={plan.name}
                  currency={plan.currency}
                  price={plan.amount}
                  credits={plan.metadata.credits}
                  className="mb-8"
                  isSelected={selectedPriceId === plan.id}
                  onClick={handleSubscriptionPlanClick}
                  discount={plan.metadata.discount}
                />
              ))}
              <Button
                isDisabled={!selectedPriceId}
                color="secondary"
                className="w-1/2 self-end"
                onClick={handleSubmit}
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;

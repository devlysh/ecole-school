"use client";

import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { Button, Select, SelectItem, Spinner } from "@nextui-org/react";
import useCurrencies from "@/hooks/useCurrencies";
import useLanguages from "@/hooks/useLanguages";
import usePlans from "@/hooks/usePlans";
import { SubscriptionPlan } from "./SubscriptionPlan";
import { groupByCurrency } from "@/lib/utils";
import { Currency, Language } from "@/lib/types";

const LanguageSelect = ({
  languages,
  languagesLoading,
  defaultLanguage = "en",
}: {
  languages: Language[];
  languagesLoading: boolean;
  defaultLanguage?: string;
}) =>
  languagesLoading ? (
    <Spinner size="sm" color="secondary" />
  ) : (
    <Select
      label="Learning language"
      labelPlacement="outside"
      defaultSelectedKeys={[defaultLanguage]}
    >
      {languages.map((language) => (
        <SelectItem key={language.code}>{language.name}</SelectItem>
      ))}
    </Select>
  );

const CurrencySelect = ({
  currencies,
  currenciesLoading,
  selectedCurrency,
  onCurrencyChange,
}: {
  currencies: Currency[];
  currenciesLoading: boolean;
  selectedCurrency: string;
  onCurrencyChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) =>
  currenciesLoading ? (
    <Spinner size="sm" color="secondary" />
  ) : (
    <Select
      label="Currency"
      labelPlacement="outside"
      defaultSelectedKeys={[selectedCurrency]}
      onChange={onCurrencyChange}
    >
      {currencies.map((currency) => (
        <SelectItem key={currency.code}>{currency.name}</SelectItem>
      ))}
    </Select>
  );

const Pricing = () => {
  const { languages, languagesLoading } = useLanguages();
  const { currencies, currenciesLoading } = useCurrencies();
  const { plans, plansLoading } = usePlans();

  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency["code"]>("USD");

  const plansByCurrency = useMemo(() => {
    const map = groupByCurrency(plans);
    const filteredPlans = map.get(selectedCurrency.toLowerCase()) || [];
    return filteredPlans.sort((a, b) => a.amount - b.amount);
  }, [plans, selectedCurrency]);

  const handleCurrencyChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedCurrency(event.target.value);
    },
    []
  );

  const handleSubscriptionPlanClick = useCallback((id: string) => {
    setSelectedPlanId(id);
  }, []);

  return (
    <div className="flex p-8">
      <div className="w-1/2 p-8">
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
              languagesLoading={languagesLoading}
            />
          </div>
          <div className="w-1/3">
            <CurrencySelect
              currencies={currencies}
              currenciesLoading={currenciesLoading}
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
      <div className="w-1/2 p-8">
        <div className="text-2xl">Recurring number of classes:</div>
        <div className="text-base my-8">Total changes every 4 weeks</div>
        <div className="flex flex-col">
          {plansLoading || !plans.length ? (
            <Spinner size="sm" color="secondary" />
          ) : (
            <>
              {plansByCurrency.map((plan) => (
                <SubscriptionPlan
                  id={plan.id}
                  key={plan.name}
                  description={plan.name}
                  currency={plan.currency.toUpperCase()}
                  price={(plan.amount / 100).toFixed(2).toString()}
                  pricePerClass={(plan.amount / 100 / parseInt(plan.name, 10))
                    .toFixed(2)
                    .toString()}
                  className="mb-8"
                  isSelected={selectedPlanId === plan.id}
                  onClick={handleSubscriptionPlanClick}
                />
              ))}
              <Button
                isDisabled={!selectedPlanId}
                color="secondary"
                className="w-1/2 self-end"
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

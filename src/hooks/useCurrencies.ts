"use client";

import { getCurrenciesRequest } from "@/app/api/v1/currencies/request";
import { Currency } from "@/lib/types";
import { useState, useEffect } from "react";

const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const currencies = await getCurrenciesRequest();
        setCurrencies(currencies);
      } catch (err: unknown) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  return { currencies, currenciesLoading: loading, currenciesError: error };
};

export default useCurrencies;

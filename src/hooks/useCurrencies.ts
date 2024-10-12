import { Currency } from "@/lib/types";
import { useState, useEffect } from "react";

const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("/api/v1/currencies");
        if (!response.ok) {
          throw new Error("Failed to fetch currencies");
        }
        const data = await response.json();
        setCurrencies(data);
      } catch (err) {
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

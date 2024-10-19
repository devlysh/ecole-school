"use client";

import { ChangeEvent } from "react";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { Currency } from "@/lib/types";

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
    <div className="w-full text-center">
      <Spinner size="sm" color="secondary" />
    </div>
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

export default CurrencySelect;

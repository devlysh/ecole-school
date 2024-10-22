"use client";

import { ChangeEvent } from "react";
import { Select, SelectItem } from "@nextui-org/react";
import { Currency } from "@/lib/types";

const CurrencySelect = ({
  currencies,
  selectedCurrency,
  onCurrencyChange,
}: {
  currencies: Currency[];
  selectedCurrency: string;
  onCurrencyChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => (
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

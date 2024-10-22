"use client";

import { ChangeEvent } from "react";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { Language } from "@/lib/types";

const LanguageSelect = ({
  languages,
  selectedLanguage,
  onLanguageChange,
}: {
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => (
  <Select
    label="Learning language"
    labelPlacement="outside"
    defaultSelectedKeys={[selectedLanguage]}
    onChange={onLanguageChange}
  >
    {languages.map((language) => (
      <SelectItem key={language.code}>{language.name}</SelectItem>
    ))}
  </Select>
);

export default LanguageSelect;

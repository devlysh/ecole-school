import React, { useState } from "react";
import { Input } from "@nextui-org/input";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setIsValid(newValue.trim().length > 0);
    onChange(newValue);
  };

  return (
    <Input
      id={id}
      label={label}
      value={value}
      onChange={handleChange}
      isInvalid={!isValid}
      errorMessage={!isValid ? "This field is required" : ""}
      autoFocus
    />
  );
};

export default TextField;

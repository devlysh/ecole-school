import React, { useCallback, useState } from "react";
import { Input } from "@nextui-org/input";

interface EmailFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const EmailField: React.FC<EmailFieldProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  const [isValid, setIsValid] = useState(true);

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setIsValid(validateEmail(newValue));
      onChange(newValue);
    },
    [validateEmail, onChange]
  );

  return (
    <Input
      id={id}
      label={label}
      type="email"
      value={value}
      onChange={handleChange}
      isInvalid={!isValid}
      errorMessage={!isValid ? "Please enter a valid email address" : ""}
      autoFocus
    />
  );
};

export default EmailField;

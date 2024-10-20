import React, { useCallback, useState } from "react";
import { Input } from "@nextui-org/input";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  shouldValidate: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  shouldValidate,
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const validatePassword = useCallback(
    (password: string) => {
      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long");
        return false;
      }
      if (!/[A-Z]/.test(password)) {
        setErrorMessage("Password must contain at least one uppercase letter");
        return false;
      }
      if (!/[a-z]/.test(password)) {
        setErrorMessage("Password must contain at least one lowercase letter");
        return false;
      }
      if (!/[0-9]/.test(password)) {
        setErrorMessage("Password must contain at least one digit");
        return false;
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        setErrorMessage("Password must contain at least one symbol");
        return false;
      }
      return true;
    },
    [setErrorMessage]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const valid = shouldValidate ? validatePassword(newValue) : true;
      setIsValid(valid);
      onChange(newValue);
    },
    [shouldValidate, validatePassword, onChange]
  );

  return (
    <Input
      id={id}
      label={label}
      type="password"
      value={value}
      onChange={handleChange}
      isInvalid={!isValid}
      errorMessage={!isValid ? errorMessage : ""}
      autoFocus
    />
  );
};

export default PasswordField;

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@nextui-org/button";
import {
  FormStep as FormStepType,
  FormFieldType,
  TokenType,
  PreAuthTokenPayload,
} from "@/lib/types";
import Cookies from "js-cookie";
import TextField from "./FormFields/TextField";
import EmailField from "./FormFields/EmailField";
import PasswordField from "./FormFields/PasswordField";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

interface FormStepProps {
  step: FormStepType;
  onNext: (values: Record<string, string>) => void;
  onChange?: (values: Record<string, string>) => void;
  error?: string | null;
  isDisabled?: boolean;
}

const FormStep: React.FC<FormStepProps> = ({
  step,
  onNext,
  onChange,
  error,
  isDisabled,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const handleChange = useCallback(
    (fieldId: string, value: string) => {
      setValues((prevValues) => {
        const newValues = { ...prevValues, [fieldId]: value };
        return newValues;
      });
    },
    [setValues]
  );

  const handleSubmit = useCallback(() => {
    onNext(values);
  }, [onNext, values]);

  useEffect(() => {
    const allFieldsFilled = step.fields.every((field) =>
      values[field.name]?.trim()
    );
    setIsValid(allFieldsFilled);
  }, [values, step.fields]);

  useEffect(() => {
    const preAuthToken = Cookies.get(TokenType.PRE_AUTH);

    if (!preAuthToken) {
      return;
    }

    try {
      const decodedPreAuthToken = jwt.decode(
        preAuthToken
      ) as PreAuthTokenPayload;

      const value =
        decodedPreAuthToken[step.name as keyof PreAuthTokenPayload]?.toString();

      if (value) {
        setValues((prevValues) => ({ ...prevValues, [step.name]: value }));
      }
    } catch (err: unknown) {
      logger.error(err, "Failed to decode pre-auth token");
    }
  }, [step.name]);

  useEffect(() => {
    onChange?.(values);
  }, [onChange, values]);

  const renderField = useCallback(
    (field: FormStepType["fields"][0]) => {
      const commonProps = {
        id: field.name,
        label: field.label,
        value: values[field.name] ?? "",
        onChange: (value: string) => handleChange(field.name, value),
      };

      switch (field.type) {
        case FormFieldType.TEXT:
          return <TextField {...commonProps} />;
        case FormFieldType.EMAIL:
          return <EmailField {...commonProps} />;
        case FormFieldType.PASSWORD:
          return (
            <PasswordField
              {...commonProps}
              shouldValidate={field.shouldValidate ?? false}
            />
          );
        default:
          return null;
      }
    },
    [handleChange, values]
  );

  return (
    <div className="w-full">
      <div className="text-3xl mb-8">{step.text}</div>
      {step.fields.map((field) => (
        <div key={field.name} className="mb-4">
          {renderField(field)}
        </div>
      ))}
      {error && <div className="text-red-500 text-sm my-4">{error}</div>}
      <Button
        className="w-full"
        variant="solid"
        color="secondary"
        onClick={handleSubmit}
        isDisabled={!isValid || isDisabled}
      >
        Submit
      </Button>
      {step.footerText && <div className="text-xs mt-8">{step.footerText}</div>}
    </div>
  );
};

export default FormStep;

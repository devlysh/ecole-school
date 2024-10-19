"use client";

import { FormFieldType, FormStep as FormStepType, StepType } from "@/lib/types";
import FormStep from "./FormStep";
import { useCallback, useState } from "react";
import logger from "@/lib/logger";

const setPasswordStep = {
  name: "password",
  type: StepType.FORM,
  text: "What is your email?",
  fields: [
    {
      name: "password",
      type: FormFieldType.PASSWORD,
      label: "Password",
      shouldValidate: true,
    },
    {
      name: "confirmPassword",
      type: FormFieldType.PASSWORD,
      label: "Confirm Password",
      shouldValidate: false,
    },
  ],
  footerText:
    "Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
} as FormStepType;

const SetPasswordStep = () => {
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<{ [key: string]: string }>({});

  const handleNext = useCallback(
    (values: { [key: string]: string }) => {
      if (values.password !== values.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setError(null);
      logger.debug({ values }, "Password set");
    },
    [setError]
  );

  const handleChange = useCallback(
    (values: { [key: string]: string }) => {
      setValues(values);
      logger.debug({ values }, "Values changed");
    },
    [setValues]
  );

  return (
    <div className="flex flex-col justify-center items-center mt-12">
      <div className="w-1/2 text-center flex flex-col items-center">
        <FormStep
          step={setPasswordStep}
          onNext={handleNext}
          onChange={handleChange}
          error={error}
          isDisabled={values.password !== values.confirmPassword}
        />
      </div>
    </div>
  );
};

export default SetPasswordStep;

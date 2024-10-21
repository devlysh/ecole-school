"use client";

import { FormFieldType, FormStep as FormStepType, StepType } from "@/lib/types";
import FormStep from "./FormStep";
import { useCallback, useState, useEffect } from "react";
import { setPassword } from "@/app/api/v1/set-password/request";
import logger from "@/lib/logger";
import { useRouter } from "next/navigation";

const setPasswordStep = {
  name: "password",
  type: StepType.FORM,
  text: "Create your password",
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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    setToken(urlToken);

    if (!urlToken) {
      router.push("/quiz");
    }
  }, [router]);

  const handleNext = useCallback(
    async (values: Record<string, string>) => {
      if (values.password !== values.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setError(null);

      if (!token) {
        router.push("/quiz");
        return;
      }

      const response = await setPassword(values.password, token);

      if (!response.ok) {
        logger.error({ response }, "Failed to set password");
        setError("Failed to set password");
        return;
      }

      router.push("/account");
    },
    [router, token]
  );

  const handleChange = useCallback(
    (values: Record<string, string>) => {
      setValues(values);
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

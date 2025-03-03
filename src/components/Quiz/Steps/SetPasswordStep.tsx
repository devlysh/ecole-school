"use client";

import FormStep from "./FormStep";
import { useCallback, useState, useEffect } from "react";
import { setPasswordRequest } from "@/app/api/v1/password/request";
import logger from "@/lib/logger";
import { useRouter } from "next/navigation";
import { setPasswordStep } from "@domain/models/SetPasswordStep.model";
import { TokenType } from "@/lib/types";
import { toast } from "react-toastify";

const SetPasswordStep = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get(
      TokenType.URL_TOKEN
    );
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

      try {
        await setPasswordRequest(values.password, token);
        router.push("/account");
      } catch (err: unknown) {
        setError("Failed to set password");
        toast.error("Failed to set password");
        logger.error(err, "Error during setting password");
      }
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

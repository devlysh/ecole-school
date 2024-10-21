import logger from "@/lib/logger";

export const submitPlanRequest = async () => {
  const response = await fetch("/api/v1/submit-plan");

  if (!response.ok) {
    logger.error({ response }, "Error during plan submission");
    throw new Error(response.statusText ?? "Failed to submit plan");
  }
};

import logger from "@/lib/logger";

export const getPlans = async () => {
  const response = await fetch("/api/v1/stripe/plans");

  if (!response.ok) {
    logger.error({ response }, "Error during fetch plans");
    throw new Error(response.statusText ?? "Failed to fetch plans");
  }

  return await response.json();
};

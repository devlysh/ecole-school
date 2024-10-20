import logger from "@/lib/logger";

export const getCurrencies = async () => {
  const response = await fetch("/api/v1/currencies");

  if (!response.ok) {
    logger.error({ response }, "Error during fetch currencies");
    throw new Error(response.statusText ?? "Failed to fetch currencies");
  }

  return await response.json();
};

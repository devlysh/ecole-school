import logger from "@/lib/logger";

export const getLanguages = async () => {
  const response = await fetch("/api/v1/languages");

  if (!response.ok) {
    logger.error({ response }, "Error during fetch languages");
    throw new Error(response.statusText ?? "Failed to fetch plans");
  }

  return await response.json();
};

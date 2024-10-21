import logger from "@/lib/logger";

export const submitCheckoutRequest = async () => {
  const response = await fetch("/api/v1/submit-checkout");

  if (!response.ok) {
    logger.error({ response }, "Error during checkout submission");
    throw new Error(response.statusText ?? "Failed to submit checkout");
  }
};

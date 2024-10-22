import logger from "@/lib/logger";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const getPlansRequest = async () => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/stripe/plans`);

  if (!response.ok) {
    logger.error({ response }, "Error during fetch plans");
    throw new Error(response.statusText ?? "Failed to fetch plans");
  }

  return await response.json();
};

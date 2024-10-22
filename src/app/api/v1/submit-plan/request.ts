import logger from "@/lib/logger";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const submitPlanRequest = async () => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/submit-plan`);

  if (!response.ok) {
    logger.error({ response }, "Error during plan submission");
    throw new Error(response.statusText ?? "Failed to submit plan");
  }
};

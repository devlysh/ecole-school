import logger from "@/lib/logger";

export const checkEmail = async (
  email: string
): Promise<{ error: unknown; isTaken?: boolean }> => {
  const response = await fetch("/api/v1/check-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    logger.error({ response }, "Error during check if email is taken");
    throw new Error(response.statusText ?? "Failed to check if email is taken");
  }

  return await response.json();
};

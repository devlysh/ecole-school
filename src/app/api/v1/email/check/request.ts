import logger from "@/lib/logger";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export interface CheckEmailRequest {
  email: string;
}

export const checkEmailRequest = async (
  email: string
): Promise<{ error: unknown; isTaken?: boolean }> => {
  const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/email/check`, {
    method: "POST",
    body: JSON.stringify({ email } as CheckEmailRequest),
  });

  if (!response.ok) {
    logger.error({ response }, "Error during check if email is taken");
    throw new Error(response.statusText ?? "Failed to check if email is taken");
  }

  return await response.json();
};

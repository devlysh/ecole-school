import logger from "@/lib/logger";

export const logoutRequest = async () => {
  const response = await fetch("/api/v1/logout");

  if (!response.ok) {
    logger.error({ response }, "Error during logout");
    throw new Error(response.statusText ?? "Failed to logout");
  }
};

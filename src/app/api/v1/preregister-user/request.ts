import logger from "@/lib/logger";

export const preRegisterUser = async () => {
  const response = await fetch("/api/v1/preregister-user");

  if (!response.ok) {
    logger.error({ response }, "Error during preregister user");
    throw new Error(response.statusText ?? "Failed to preregister user");
  }
};

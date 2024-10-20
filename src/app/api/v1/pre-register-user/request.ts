import logger from "@/lib/logger";

export const preRegisterUserRequest = async () => {
  const response = await fetch("/api/v1/pre-register-user");

  if (!response.ok) {
    logger.error({ response }, "Error during pre-register user");
    throw new Error(response.statusText ?? "Failed to pre-register user");
  }
};

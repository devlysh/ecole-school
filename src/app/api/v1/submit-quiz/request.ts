import logger from "@/lib/logger";

export const submitQuizRequest = async () => {
  const response = await fetch("/api/v1/submit-quiz");

  if (!response.ok) {
    logger.error({ response }, "Error during quiz submission");
    throw new Error(response.statusText ?? "Failed to submit quiz");
  }
};

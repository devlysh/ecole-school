import logger from "./logger";

// Function to log errors with enhanced context
export const logError = (
  error: unknown,
  context: string,
  additionalInfo?: Record<string, unknown>
) => {
  logger.error(
    {
      error,
      context,
      ...additionalInfo,
    },
    `Error occurred in ${context}`
  );
};

// Function to format error messages for HTTP responses
export const formatErrorResponse = (message: string, statusCode: number) => {
  return {
    status: statusCode,
    body: JSON.stringify({ error: message }),
  };
};

// Function to handle errors consistently
export const handleError = (error: unknown, context: string) => {
  logError(error, context);
  return formatErrorResponse("An unexpected error occurred.", 500);
};

// Function to handle error responses
export const handleErrorResponse = (message: string, status: number) => {
  return {
    status,
    body: JSON.stringify({ error: message }),
  };
};

import logger from "./logger";

export const handleErrorResponse = (
  err: Error,
  status: number,
  additionalInfo?: Record<string, unknown>
) => {
  logger.error({ err, ...additionalInfo }, "Error");
  return Response.json(
    { error: err, message: err.message, ...additionalInfo },
    { status }
  );
};

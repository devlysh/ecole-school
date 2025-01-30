import { EmailIsMissingError } from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { SettingsService } from "@domain/services/Settings.service";

export const DELETE = async () => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      throw new EmailIsMissingError();
    }

    const settingsService = new SettingsService();
    await settingsService.resetAssignedTeacher(email);
    return Response.json(
      { message: "Assigned teacher reset" },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    }
    logger.error(err, "Failed to reset assigned teacher");
    return handleErrorResponse(
      new Error("Failed to reset assigned teacher"),
      500
    );
  }
};

import { verifyAccessToken } from "@/lib/jwt";
import { handleErrorResponse } from "@/lib/errorUtils";
import { SettingsService } from "@domain/services/Settings.service";
import { Settings } from "@/lib/types";
import { EmailIsMissingError } from "@/lib/errors";
import logger from "@/lib/logger";

export const GET = async () => {
  return await handleGetSettingsRequest();
};

const handleGetSettingsRequest = async () => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!email) {
      throw new EmailIsMissingError();
    }

    const settingsService = new SettingsService();
    const settings = await settingsService.getSettings(email);

    return Response.json(settings, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      logger.error(err, "User not found");
      return handleErrorResponse(err, 401);
    }
    logger.error(err, "Failed to get settings");
    return handleErrorResponse(new Error("Failed to get settings"), 500);
  }
};

export const PUT = async (request: Request) => {
  return await handleUpdateSettingsRequest(request);
};

const handleUpdateSettingsRequest = async (request: Request) => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!email) {
      throw new EmailIsMissingError();
    }

    const settingsService = new SettingsService();
    const settingsData: Partial<Settings> = await request.json();

    const updatedSettings = await settingsService.updateSettings(
      email,
      settingsData
    );

    return Response.json(updatedSettings, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      logger.error(err, "User not found");
      return handleErrorResponse(err, 401);
    }
    logger.error(err, "Error during updating settings");
    return handleErrorResponse(new Error("Failed to update settings"), 500);
  }
};

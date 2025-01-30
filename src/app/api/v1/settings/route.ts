import { verifyAccessToken } from "@/lib/jwt";
import { handleErrorResponse, logError } from "@/lib/errorUtils";
import { SettingsService } from "@domain/services/Settings.service";
import { Settings } from "@/lib/types";

export const GET = async () => {
  return await handleGetSettingsRequest();
};

const handleGetSettingsRequest = async () => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;
    if (!email) {
      return handleErrorResponse("Unauthorized", 401);
    }

    const settingsService = new SettingsService();
    const settings = await settingsService.getSettings(email);

    return Response.json(settings, { status: 200 });
  } catch (err: unknown) {
    logError(err, "Error during getting settings", {
      endpoint: "GET /settings",
    });
    return handleErrorResponse("Failed to get settings", 500);
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
      return handleErrorResponse("Unauthorized", 401);
    }

    const settingsService = new SettingsService();
    const settingsData: Partial<Settings> = await request.json();

    const updatedSettings = await settingsService.updateSettings(
      email,
      settingsData
    );

    return Response.json(updatedSettings, { status: 200 });
  } catch (err: unknown) {
    logError(err, "Error during updating settings", {
      endpoint: "PUT /settings",
    });
    return handleErrorResponse("Failed to update settings", 500);
  }
};

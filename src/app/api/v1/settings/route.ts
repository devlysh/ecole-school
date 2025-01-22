import { verifyAccessToken } from "@/lib/jwt";
import { handleErrorResponse } from "@/lib/utils";
import { SettingsService } from "@domain/services/Settings.service";

export const GET = async () => {
  return await handleGetSettingsRequest();
};

const handleGetSettingsRequest = async () => {
  const decodedToken = await verifyAccessToken();
  const email = decodedToken?.email;
  if (!email) {
    return handleErrorResponse("Unauthorized", 401);
  }

  const settingsService = new SettingsService();
  const settings = await settingsService.getSettings(email);

  return Response.json(settings, { status: 200 });
};

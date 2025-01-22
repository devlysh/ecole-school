import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { SettingsService } from "@domain/services/Settings.service";

export const PUT = async () => {
  const decodedToken = await verifyAccessToken();
  const email = decodedToken?.email;

  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settingsService = new SettingsService();
    await settingsService.resetAssignedTeacher(email);
  } catch (error) {
    logger.error({ error }, "Failed to reset assigned teacher");
    return Response.json(
      { error: "Failed to reset assigned teacher" },
      { status: 500 }
    );
  }

  return Response.json({ message: "Assigned teacher reset" }, { status: 200 });
};

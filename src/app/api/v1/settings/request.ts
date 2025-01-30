import logger from "@/lib/logger";
import { Settings } from "@/lib/types";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const getSettingsRequest = async (): Promise<Settings | undefined> => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/settings`);

    if (!response.ok) {
      Response.json({ error: "Failed to get settings" }, { status: 500 });
      return;
    }

    return await response.json();
  } catch (err: unknown) {
    logger.error({ error: err }, "Error during getting settings");
    Response.json({ error: "Failed to get settings" }, { status: 401 });
    return;
  }
};

export const updateSettingsRequest = async (
  settings: Partial<Settings>
): Promise<Settings> => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/settingse`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const message = "Failed to update settings";
      throw new Error(message);
    }

    return await response.json();
  } catch (err: unknown) {
    logger.error({ error: err }, "Error during updating settings");
    throw new Error("Failed to update settings");
  }
};

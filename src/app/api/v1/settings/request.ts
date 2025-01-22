import logger from "@/lib/logger";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!NEXT_PUBLIC_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not set");
}

export const getSettingsRequest = async () => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/v1/settings`);

    if (!response.ok) {
      return Response.json(
        { error: "Failed to get settings" },
        { status: 500 }
      );
    }

    return await response.json();
  } catch (err: unknown) {
    logger.error({ error: err }, "Error during getting settings");
    return Response.json({ error: "Failed to get settings" }, { status: 401 });
  }
};

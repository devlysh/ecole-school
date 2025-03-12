import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";

export const GET = async () => {
  try {
    const { roles } = await verifyAccessToken();
    return Response.json({ roles }, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Failed to fetch roles");
    return Response.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
};

import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { AccessTokenMissingError } from "@/lib/errors";

export default async function Home() {
  try {
    await verifyAccessToken();
    redirect("/account");
  } catch (err: unknown) {
    if (err instanceof AccessTokenMissingError) {
      logger.info("No access token found, redirecting to login");
      redirect("/login");
    }
  }
}

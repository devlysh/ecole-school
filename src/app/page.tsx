import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";

export default async function Home() {
  try {
    await verifyAccessToken();
    redirect("/account");
  } catch {
    logger.info("No access token found, redirecting to login");
    redirect("/login");
  }
}

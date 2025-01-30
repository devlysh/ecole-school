import logger from "@/lib/logger";
import { signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";
import { handleErrorResponse } from "@/lib/errorUtils";

export const POST = async () => {
  const cookieStore = cookies();

  try {
    const existingPreAuthTokenCookie = cookieStore.get(TokenType.PRE_AUTH);
    const existingPreAuthToken = existingPreAuthTokenCookie?.value;
    const email = cookieStore.get("email")?.value;

    if (!existingPreAuthToken) {
      logger.error("No pre-auth token found");
      redirect("/quiz");
    }

    const decodedPreAuthToken = (await verifyToken(
      existingPreAuthToken
    )) as unknown as PreAuthTokenPayload;

    if (!decodedPreAuthToken || !decodedPreAuthToken.email) {
      logger.error("Invalid pre-auth token");
      redirect("/quiz");
    }

    delete decodedPreAuthToken.exp;

    const tokenData: PreAuthTokenPayload = {
      ...decodedPreAuthToken,
      email: email ?? decodedPreAuthToken.email,
    };

    const hours = 1; // 1 hour

    const newPreAuthToken = await signToken(tokenData, `${hours}h`);

    cookieStore.set(TokenType.PRE_AUTH, newPreAuthToken, {
      maxAge: 60 * 60 * hours,
    });
    cookieStore.delete(TokenType.PRE_AUTH);
    return Response.json(null, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error during checkout submission");
    return handleErrorResponse(new Error("Failed to submit checkout"), 500);
  }
};

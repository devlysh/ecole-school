import logger from "@/lib/logger";
import { signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";

export const GET = async () => {
  const cookieStore = cookies();

  try {
    const existingPreAuthToken = cookieStore.get(TokenType.PRE_AUTH);
    const email = cookieStore.get("email");

    cookieStore.delete(TokenType.PRE_AUTH);
    cookieStore.delete("email");

    if (!existingPreAuthToken) {
      redirect("/quiz");
    }

    const decodedPreAuthToken = (await verifyToken(
      existingPreAuthToken.value
    )) as PreAuthTokenPayload;

    if (!decodedPreAuthToken) {
      redirect("/quiz");
    }

    delete decodedPreAuthToken.exp;

    const tokenData = {
      ...decodedPreAuthToken,
      email: email || decodedPreAuthToken.email,
    };
    const newPreAuthToken = await signToken(tokenData, "1h");

    cookieStore.set(TokenType.PRE_AUTH, newPreAuthToken, {
      maxAge: 60 * 60 * 1, // 1 hour
    });
    return Response.json(null);
  } catch (err: unknown) {
    logger.error(err, "Error during checkout submission");
    return Response.json("Failed to submit checkout", { status: 500 });
  }
};

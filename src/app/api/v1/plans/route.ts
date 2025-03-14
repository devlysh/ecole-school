import logger from "@/lib/logger";
import { signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";
import { handleErrorResponse } from "@/lib/errorUtils";

export const POST = async () => {
  const cookieStore = cookies();

  try {
    const existingPreAuthToken = cookieStore.get(TokenType.PRE_AUTH);
    const currency = cookieStore.get("currency")?.value;
    const language = cookieStore.get("language")?.value;
    const selectedPrice = cookieStore.get("selectedPrice")?.value;

    cookieStore.delete(TokenType.PRE_AUTH);
    cookieStore.delete("currency");
    cookieStore.delete("language");
    cookieStore.delete("selectedPrice");

    if (!existingPreAuthToken) {
      redirect("/quiz");
    }

    const decodedPreAuthToken = (await verifyToken(
      existingPreAuthToken.value
    )) as unknown as PreAuthTokenPayload;

    if (!decodedPreAuthToken) {
      redirect("/quiz");
    }

    const { email, name, quizAnswers } = decodedPreAuthToken;

    const tokenData = {
      name,
      email,
      currency,
      language,
      selectedPrice,
      quizAnswers,
    };
    const newPreAuthToken = await signToken(tokenData, "1h");
    cookieStore.set(TokenType.PRE_AUTH, newPreAuthToken, {
      maxAge: 60 * 60 * 1, // 1 hour
    });
    return Response.json(null, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error during plan submission");
    return handleErrorResponse(new Error("Error during plan submission"), 500);
  }
};

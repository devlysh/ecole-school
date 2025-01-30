import logger from "@/lib/logger";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { PreAuthTokenPayload, TokenType } from "@/lib/types";
import { BadRequestError } from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";

export const POST = async () => {
  const cookieStore = cookies();

  try {
    const name = cookieStore.get("name")?.value;
    const email = cookieStore.get("email")?.value;
    const currentLevel = cookieStore.get("currentLevel")?.value;
    const motivatesYou = cookieStore.get("motivatesYou")?.value;
    const areasToFocus = cookieStore.get("areasToFocus")?.value;
    const studyTimePerWeek = cookieStore.get("studyTimePerWeek")?.value;

    cookieStore.delete("name");
    cookieStore.delete("email");
    cookieStore.delete("currentLevel");
    cookieStore.delete("motivatesYou");
    cookieStore.delete("areasToFocus");
    cookieStore.delete("studyTimePerWeek");

    const quizAnswers = {
      currentLevel: currentLevel || "",
      motivatesYou: motivatesYou || "",
      areasToFocus: areasToFocus || "",
      studyTimePerWeek: studyTimePerWeek || "",
    };

    if (!name || !email) {
      throw new BadRequestError("Invalid quiz submission");
    }

    const tokenData: PreAuthTokenPayload = { name, email, quizAnswers };

    const preAuthToken = await signToken(tokenData, "1h");

    cookieStore.set(TokenType.PRE_AUTH, preAuthToken, {
      maxAge: 60 * 60 * 1, // 1 hour
    });

    return Response.json(null, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof BadRequestError) {
      return handleErrorResponse(err, 400);
    }
    logger.error(err, "Error during quiz submission");
    return handleErrorResponse(new Error("Failed to submit quiz"), 500);
  }
};

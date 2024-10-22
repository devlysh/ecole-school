import logger from "@/lib/logger";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { TokenType } from "@/lib/types";

export const GET = async () => {
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

    const tokenData = {
      name,
      email,
      quizAnswers: {
        currentLevel,
        motivatesYou,
        areasToFocus,
        studyTimePerWeek,
      },
    };

    const preAuthToken = await signToken(tokenData, "1h");

    cookieStore.set(TokenType.PRE_AUTH, preAuthToken, {
      maxAge: 60 * 60 * 1, // 1 hour
    });

    return Response.json(null);
  } catch (err: unknown) {
    logger.error(err, "Error during quiz submission");
    return Response.json("Failed to submit quiz", { status: 500 });
  }
};

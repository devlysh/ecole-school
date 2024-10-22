import logger from "@/lib/logger";
import { signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IntroTokenPayload } from "@/lib/types";

export const GET = async () => {
  const cookieStore = cookies();

  try {
    const existingToken = cookieStore.get("token");
    const currency = cookieStore.get("currency")?.value;
    const language = cookieStore.get("language")?.value;
    const selectedPrice = cookieStore.get("selectedPrice")?.value;

    cookieStore.delete("token");
    cookieStore.delete("currency");
    cookieStore.delete("language");
    cookieStore.delete("selectedPrice");

    if (!existingToken) {
      redirect("/quiz");
    }

    const decodedToken = (await verifyToken(
      existingToken.value
    )) as IntroTokenPayload;

    if (!decodedToken) {
      redirect("/quiz");
    }

    const { email, name, quizAnswers } = decodedToken;

    const tokenData = {
      name,
      email,
      currency,
      language,
      selectedPrice,
      quizAnswers,
    };
    const newToken = signToken(tokenData, "1h");
    cookieStore.set("token", newToken, {
      maxAge: 60 * 60 * 1, // 1 hour
    });
    return Response.json(null);
  } catch (err: unknown) {
    logger.error(err, "Error during plan submission");
    return Response.json("Failed to submit plan", { status: 500 });
  }
};

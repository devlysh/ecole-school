import logger from "@/lib/logger";
import { appendCookieToResponse, signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IntroTokenPayload } from "@/lib/types";

export const GET = async () => {
  const cookieStore = cookies();

  try {
    const existingToken = cookieStore.get("token");
    const email = cookieStore.get("email");

    cookieStore.delete("token");
    cookieStore.delete("email");

    if (!existingToken) {
      redirect("/quiz");
    }

    const decodedToken = (await verifyToken(
      existingToken.value
    )) as IntroTokenPayload;

    if (!decodedToken) {
      redirect("/quiz");
    }

    delete decodedToken.exp;

    const tokenData = { ...decodedToken, email: email || decodedToken.email };

    const newToken = signToken(tokenData, "1h");
    const response = Response.json(newToken);
    appendCookieToResponse(response, newToken);
    return response;
  } catch (err: unknown) {
    logger.error(err, "Error during checkout submission");
    return Response.json("Failed to submit checkout", { status: 500 });
  }
};
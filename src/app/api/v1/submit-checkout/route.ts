import logger from "@/lib/logger";
import { signToken, verifyToken } from "@/lib/jwt";
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

    cookieStore.set("token", newToken, {
      maxAge: 60 * 60 * 1, // 1 hour
    });
    return Response.json(null);
  } catch (err: unknown) {
    logger.error(err, "Error during checkout submission");
    return Response.json("Failed to submit checkout", { status: 500 });
  }
};

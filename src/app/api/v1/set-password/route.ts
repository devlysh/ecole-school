import { verifyToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { CookiesPayload } from "@/lib/types";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  const { token, password } = await request.json();

  try {
    const decodedToken = verifyToken(token);

    const { email } = decodedToken as CookiesPayload;

    logger.info({ email, password }, "Setting password for user");

    // TODO: Implement password setting

    const cookieStore = cookies();

    cookieStore.delete("token");
    cookieStore.delete("registrationToken");

    cookieStore.delete("email");
    cookieStore.delete("name");
    cookieStore.delete("currency");
    cookieStore.delete("language");
    cookieStore.delete("priceId");
    cookieStore.delete("selectedPrice");

    return Response.json({ message: "Password set" }, { status: 200 });
  } catch (err: unknown) {
    logger.error({ err }, "Invalid token");
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
};

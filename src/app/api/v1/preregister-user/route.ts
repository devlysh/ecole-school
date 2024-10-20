import logger from "@/lib/logger";
import { signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { CookiesPayload } from "@/lib/types";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing!");
}

const cookiesList = [
  "name",
  "email",
  "currentLevel",
  "motivatesYou",
  "areasToFocus",
  "studyTimePerWeek",
  "currency",
  "language",
  "priceId",
  "selectedPrice",
];

export const GET = async () => {
  try {
    const cookieStore = cookies();
    let cookiesData = cookiesList.reduce(
      (data: Record<string, string>, cookieName: string) => {
        const cookie = cookieStore.get(cookieName);
        if (cookie) {
          data[cookieName] = cookie.value;
        }
        return data;
      },
      {}
    );

    const existingToken = cookieStore.get("token");

    if (existingToken) {
      const decodedToken = (await verifyToken(
        existingToken.value
      )) as CookiesPayload;
      delete decodedToken.exp;
      cookiesData = { ...cookiesData, ...decodedToken };
    }

    const token = signToken(cookiesData, { expiresIn: "1h" });

    const response = Response.json(token);

    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; Max-Age=${60 * 60 * 1};`
    );
    return response;
  } catch (err: unknown) {
    logger.error(err, "Error during user registration");
    return Response.json("Failed to preregister user", { status: 500 });
  }
};

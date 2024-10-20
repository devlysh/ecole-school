import logger from "@/lib/logger";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

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
    const cookiesData = cookiesList.map((cookie) => cookieStore.get(cookie));
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

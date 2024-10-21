import logger from "@/lib/logger";
import { appendCookieToResponse, signToken, verifyToken } from "@/lib/jwt";
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
    const cookiesData = getCookiesData(cookieStore, cookiesList);

    const existingToken = cookieStore.get("token");
    const mergedData = existingToken
      ? await mergeWithExistingTokenData(existingToken.value, cookiesData)
      : cookiesData;

    const token = signToken(mergedData, { expiresIn: "1h" });
    return createResponseWithToken(token);
  } catch (err: unknown) {
    logger.error(err, "Error during user registration");
    return Response.json("Failed to preregister user", { status: 500 });
  }
};

function getCookiesData(
  cookieStore: ReturnType<typeof cookies>,
  cookiesList: string[]
) {
  return cookiesList.reduce(
    (data: Record<string, string>, cookieName: string) => {
      const cookie = cookieStore.get(cookieName);
      if (cookie) {
        data[cookieName] = cookie.value;
      }
      return data;
    },
    {}
  );
}

async function mergeWithExistingTokenData(
  tokenValue: string,
  cookiesData: Record<string, string>
) {
  const decodedToken = (await verifyToken(tokenValue)) as CookiesPayload;
  delete decodedToken.exp;
  return { ...cookiesData, ...decodedToken };
}

function createResponseWithToken(token: string) {
  const response = Response.json(token);
  appendCookieToResponse(response, token);
  return response;
}

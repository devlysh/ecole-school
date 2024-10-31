import { JWTPayload, jwtVerify, SignJWT } from "jose";
import logger from "./logger";
import { AccessTokenPayload, TokenPayload, TokenType } from "./types";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing!");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export const signToken = async (
  payload: TokenPayload,
  expiresIn?: string | number
) => {
  let token = new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();

  if (expiresIn) {
    token = token.setExpirationTime(expiresIn);
  }

  return await token.sign(secretKey);
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("JWTExpired")) {
        logger.error({ error: err }, "Token has expired");
      } else if (err.message.includes("JWTInvalid")) {
        logger.error({ error: err }, "Invalid token signature");
      } else {
        logger.error({ error: err }, "Token verification failed");
      }
    }
    throw err;
  }
};

export const verifyAccessToken = async () => {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get(TokenType.ACCESS);

    if (!accessToken) {
      throw new Error("Access token is missing");
    }

    return (await verifyToken(
      accessToken.value
    )) as unknown as AccessTokenPayload;
  } catch (err: unknown) {
    logger.error({ error: err }, "Error during access token verification");
    throw err;
  }
};

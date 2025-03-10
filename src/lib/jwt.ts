import { JWTPayload, jwtVerify, SignJWT } from "jose";
import logger from "./logger";
import { AccessTokenPayload, TokenPayload, TokenType } from "./types";
import { cookies } from "next/headers";
import { AccessTokenMissingError } from "./errors";

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
        logger.error(err, "Token has expired");
      } else if (err.message.includes("JWTInvalid")) {
        logger.error(err, "Invalid token signature");
      } else {
        logger.error(err, "Token verification failed");
      }
    }
    throw err;
  }
};

export const verifyAccessToken = async () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(TokenType.ACCESS);

  if (!accessToken) {
    throw new AccessTokenMissingError();
  }

  return (await verifyToken(
    accessToken.value
  )) as unknown as AccessTokenPayload;
};

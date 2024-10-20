import jwt from "jsonwebtoken";
import logger from "./logger";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing!");
}

export const verifyToken = async (token: string) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing!");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err: unknown) {
    if (err instanceof jwt.JsonWebTokenError) {
      logger.error({ error: err }, "Invalid token signature");
    } else if (err instanceof jwt.TokenExpiredError) {
      logger.error({ error: err }, "Token has expired");
    } else {
      logger.error({ error: err }, "Token verification failed");
    }
    return null;
  }
};

export const signToken = (payload: object, options: jwt.SignOptions) => {
  return jwt.sign(payload, JWT_SECRET, options);
};

export const appendCookieToResponse = (
  response: Response,
  value: string,
  key: string = "token",
  hours: number = 1
) => {
  response.headers.set(
    "Set-Cookie",
    `${key}=${value}; Path=/; Max-Age=${60 * 60 * hours};`
  );
};

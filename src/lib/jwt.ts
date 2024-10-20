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
  } catch (error) {
    logger.error({ error }, "Token verification failed");
    return null;
  }
};

export const signToken = (payload: object, options: jwt.SignOptions) => {
  return jwt.sign(payload, JWT_SECRET, options);
};

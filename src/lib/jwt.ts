import jwt from "jsonwebtoken";

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
    console.error("Token verification failed:", error);
    return null;
  }
};

export const signToken = (payload: object, options: jwt.SignOptions) => {
  return jwt.sign(payload, JWT_SECRET, options);
};

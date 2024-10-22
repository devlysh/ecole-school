import { signToken, verifyToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { AuthTokenPayload, IntroTokenPayload, Role } from "@/lib/types";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing!");
}

export const POST = async (request: Request) => {
  const { token, password } = await request.json();

  try {
    const { name, email } = (await verifyToken(token)) as IntroTokenPayload;

    if (!email) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        isActive: true,
        name,
      },
    });

    const tokenData: AuthTokenPayload = {
      email,
      active: true,
      auth: true,
      role: Role.STUDENT,
    };

    const authToken = signToken(tokenData, "1d");

    const cookieStore = cookies();
    cookieStore.set("token", authToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 1,
    });

    return Response.json({ message: "Password set" }, { status: 200 });
  } catch (err: unknown) {
    logger.error({ err }, "Invalid token");
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
};

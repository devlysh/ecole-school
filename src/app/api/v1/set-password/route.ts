import { signToken, verifyToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import {
  AccessTokenPayload,
  RegistrationTokenPayload,
  TokenType,
} from "@/lib/types";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing!");
}

export const POST = async (request: Request) => {
  const { token, password } = await request.json();

  try {
    const { email } = (await verifyToken(
      token
    )) as unknown as RegistrationTokenPayload;

    if (!email) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!existingUser) {
      logger.error({ email }, "User not found during password set");
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        isActive: true,
      },
    });

    const userRoles = existingUser.roles.map((userRole) => userRole.role.name);

    const tokenData: AccessTokenPayload = {
      email,
      roles: userRoles,
    };

    const accessToken = await signToken(tokenData, "1h");

    const cookieStore = cookies();
    cookieStore.set(TokenType.ACCESS, accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 1, // 1 hour
    });

    return Response.json({ message: "Password set" }, { status: 200 });
  } catch (err: unknown) {
    logger.error({ err }, "Error setting password");
    return Response.json({ error: "Failed to set password" }, { status: 500 });
  }
};

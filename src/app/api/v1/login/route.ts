import { signToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { TokenType } from "@/lib/types";

export const POST = async (request: Request) => {
  const { email, password } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const userRoles = user.roles.map((userRole) => userRole.role.name);

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return Response.json({ error: "User is not active" }, { status: 401 });
    }

    if (!userRoles || userRoles.length === 0) {
      logger.error({ user }, "User has no roles");
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    const tokenData = {
      email: user.email,
      name: user.name ?? "Anonymous",
      roles: userRoles,
    };

    const accessToken = await signToken(tokenData, "1h");

    const cookieStore = cookies();
    cookieStore.set(TokenType.ACCESS, accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 1, // 1 hour
    });

    return Response.json({ message: "Login successful" }, { status: 200 });
  } catch (err) {
    logger.error({ err }, "Error during login");
    return Response.json({ error: "Failed to login" }, { status: 500 });
  }
};

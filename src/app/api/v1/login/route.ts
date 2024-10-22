import { signToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { TokenType, Role } from "@/lib/types";

export const POST = async (request: Request) => {
  const { email, password } = await request.json();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

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

    const tokenData = {
      email: user.email,
      role: Role.STUDENT,
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

import { signToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { TokenType } from "@/lib/types";
import {
  InvalidEmailOrPasswordError,
  UnauthorizedError,
  UserNotFoundError,
} from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";
import { UsersRepository } from "@domain/repositories/Users.repository";

export const POST = async (request: Request) => {
  const { email, password } = await request.json();

  try {
    const user = await new UsersRepository().findByEmailWithRoles(email);

    if (!user) {
      throw new UserNotFoundError();
    }

    const userRoles = user.roles.map((userRole) => userRole.role.name);

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new InvalidEmailOrPasswordError();
    }

    if (!user.isActive) {
      throw new UnauthorizedError("User is not active");
    }

    if (!userRoles || userRoles.length === 0) {
      throw new UnauthorizedError("User has no roles");
    }

    const tokenData = {
      email: user.email,
      name: user.name ?? "Anonymous",
      roles: userRoles,
    };

    const hours = 10;

    const accessToken = await signToken(tokenData, `${hours}h`);

    const cookieStore = cookies();
    cookieStore.set(TokenType.ACCESS, accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * hours, // 10 hours
    });

    return Response.json({ message: "Login successful" }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof UserNotFoundError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof InvalidEmailOrPasswordError) {
      return handleErrorResponse(err, 401);
    }

    logger.error(err, "Error during login");
    return handleErrorResponse(new Error("Failed to login"), 500);
  }
};

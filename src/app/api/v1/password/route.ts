import { signToken, verifyToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import {
  AccessTokenPayload,
  RegistrationTokenPayload,
  TokenType,
} from "@/lib/types";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { EmailIsMissingError, UserNotFoundError } from "@/lib/errors";
import { UserRepository } from "@domain/repositories/User.repository";
import { handleErrorResponse } from "@/lib/errorUtils";

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
      throw new EmailIsMissingError();
    }

    const userRepository = new UserRepository();
    const existingUser = await userRepository.findByEmailWithRoles(email);

    if (!existingUser) {
      throw new UserNotFoundError();
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await userRepository.updatePassword(existingUser.id, passwordHash);

    const userRoles = existingUser.roles.map((userRole) => userRole.role.name);

    const tokenData: AccessTokenPayload = {
      email,
      name: existingUser.name ?? "Anonymous",
      roles: userRoles,
    };

    const accessToken = await signToken(tokenData, "1h");

    const cookieStore = cookies();
    cookieStore.set(TokenType.ACCESS, accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 1, // 1 hour
    });
    cookieStore.delete(TokenType.REGISTRATION);

    return Response.json({ message: "Password set" }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof UserNotFoundError) {
      return handleErrorResponse(err, 401);
    }
    logger.error(err, "Error setting password");
    return handleErrorResponse(new Error("Failed to set password"), 500);
  }
};

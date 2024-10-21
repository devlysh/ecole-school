import { verifyToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { CookiesPayload } from "@/lib/types";
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
    const { name, email } = (await verifyToken(token)) as CookiesPayload;

    logger.debug({ token, password, name, email }, "DEBUG!");

    logger.info({ name, email, password }, "Setting password for user");

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the user in the database
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        isActive: true,
        name,
      },
    });

    // Generate JWT token
    const jwtToken = jwt.sign({ email, name }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set HttpOnly cookie
    const cookieStore = cookies();
    cookieStore.set("token", jwtToken, { httpOnly: true, path: "/" });

    // Clear other cookies
    cookieStore.delete("registrationToken");
    cookieStore.delete("email");
    cookieStore.delete("name");
    cookieStore.delete("currency");
    cookieStore.delete("language");
    cookieStore.delete("selectedPrice");
    cookieStore.delete("areasToFocus");
    cookieStore.delete("currentLevel");
    cookieStore.delete("motivatesYou");
    cookieStore.delete("studyTimePerWeek");

    return Response.json({ message: "Password set" }, { status: 200 });
  } catch (err: unknown) {
    logger.error({ err }, "Invalid token");
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
};

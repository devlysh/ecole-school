import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing!");
}

export const GET = async () => {
  try {
    const cookieStore = cookies();
    const name = cookieStore.get("name");
    const email = cookieStore.get("email");
    const currentLevel = cookieStore.get("currentLevel");
    const motivatesYou = cookieStore.get("motivatesYou");
    const areasToFocus = cookieStore.get("areasToFocus");
    const studyTimePerWeek = cookieStore.get("studyTimePerWeek");

    if (!email) {
      return Response.json("Email is required", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.value },
    });

    if (existingUser) {
      return Response.json("Email is already taken", { status: 409 });
    }

    const token = signToken(
      {
        name,
        email,
        currentLevel,
        motivatesYou,
        areasToFocus,
        studyTimePerWeek,
      },
      { expiresIn: "1h" }
    );

    const response = Response.json(token);
    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; Max-Age=3600;`
    );
    return response;
  } catch (err: unknown) {
    logger.error(err, "Error during user registration");
    return Response.json("Failed to register user", { status: 500 });
  }
};
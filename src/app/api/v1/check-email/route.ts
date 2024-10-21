import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { CheckEmailRequest } from "./request";

export const POST = async (request: Request) => {
  const { email } = (await request.json()) as CheckEmailRequest;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return Response.json({ isTaken: !!user });
  } catch (err) {
    logger.error(err, "Error checking if email exists");
    return Response.json("Failed to check if email exists", { status: 500 });
  }
};

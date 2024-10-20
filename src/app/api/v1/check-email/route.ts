import logger from "@/lib/logger";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { email } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return Response.json({ isTaken: !!user });
  } catch (err) {
    logger.error(err, "Error checking if email exists");
    return Response.json("Failed to check if email exists", { status: 500 });
  }
}

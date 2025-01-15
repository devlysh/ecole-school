import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { CreditRepository } from "@domain/repositories/Credit.repository";
import { CreditService } from "@domain/services/Credit.service";
import prisma from "@/lib/prisma";

export const GET = async (request: Request) => {
  try {
    // Verify the access token
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      return Response.json(
        { error: "Unauthorized - no email in token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
      },
    });

    if (!user || !user.student) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    const creditService = new CreditService(new CreditRepository());

    const creditCount = await creditService.getActiveCreditsCount(user.id);

    return Response.json(creditCount, { status: 200 });
  } catch (err) {
    logger.error({ err }, "Error fetching vacations");
    return Response.json(
      { error: "Failed to fetch vacations" },
      { status: 500 }
    );
  }
};

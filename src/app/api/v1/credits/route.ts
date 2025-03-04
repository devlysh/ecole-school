import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { CreditsService } from "@domain/services/Credits.service";
import { EmailIsMissingError, UnauthorizedError } from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";
import { UsersRepository } from "@domain/repositories/Users.repository";

export const GET = async () => {
  try {
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      throw new EmailIsMissingError();
    }

    const user = await new UsersRepository().findStudentByEmail(email);

    if (!user || !user.student) {
      throw new UnauthorizedError("User is not a student");
    }

    const creditService = new CreditsService();

    const creditCount = await creditService.getActiveCreditsCount(user.id);

    return Response.json(creditCount, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    }

    logger.error(err, "Error fetching credits");
    return handleErrorResponse(new Error("Failed to fetch credits"), 500);
  }
};

import { verifyAccessToken } from "@/lib/jwt";
import logger from "@/lib/logger";
import { CreditsRepository } from "@domain/repositories/Credits.repository";
import { CreditService } from "@domain/services/Credit.service";
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

    const creditService = new CreditService(new CreditsRepository());

    const creditCount = await creditService.getActiveCreditsCount(user.id);

    return Response.json(creditCount, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return handleErrorResponse(err, 401);
    } else if (err instanceof EmailIsMissingError) {
      return handleErrorResponse(err, 401);
    }

    logger.error(err, "Error fetching vacations");
    return handleErrorResponse(new Error("Failed to fetch vacations"), 500);
  }
};

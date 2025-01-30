import logger from "@/lib/logger";
import { UserRepository } from "@domain/repositories/User.repository";
import { handleErrorResponse } from "@/lib/errorUtils";

export const GET = async (
  request: Request,
  { params }: { params: { email: string } }
) => {
  try {
    const userRepository = new UserRepository();
    const user = await userRepository.findByEmail(params.email);

    return Response.json({ isTaken: !!user }, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error checking if email exists");
    return handleErrorResponse(
      new Error("Failed to check if email exists"),
      500
    );
  }
};

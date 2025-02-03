import logger from "@/lib/logger";
import {
  AccessTokenPayload,
  AddUpdateTeacherRequest,
  RoleName,
} from "@/lib/types";
import { BadRequestError, UnauthorizedError } from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";
import { verifyAccessToken } from "@/lib/jwt";
import { UsersRepository } from "@domain/repositories/Users.repository";

export const GET = async (
  request: Request,
  { params }: { params: { email: string } }
) => {
  try {
    await verifyAccessToken();
    const userRepository = new UsersRepository();
    const teacher = await userRepository.findTeacherByEmail(params.email);
    return Response.json(teacher, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error fetching teacher by email");
    return handleErrorResponse(
      new Error("Error fetching teacher by email"),
      500
    );
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: { email: string } }
) => {
  try {
    const decodedToken: AccessTokenPayload = await verifyAccessToken();
    if (!decodedToken || !decodedToken.roles.includes(RoleName.ADMIN)) {
      throw new UnauthorizedError();
    }

    const { name, timezone, timeSlots, vacations, languages } =
      (await request.json()) as AddUpdateTeacherRequest;

    if (!name || !timezone) {
      throw new BadRequestError();
    }

    const updatedTeacher = await new UsersRepository().updateTeacherByEmail(
      params.email,
      name,
      timezone,
      timeSlots,
      vacations,
      languages
    );

    return Response.json(updatedTeacher, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return handleErrorResponse(err, 403);
    } else if (err instanceof BadRequestError) {
      return handleErrorResponse(err, 400);
    }
    logger.error(err, "Error updating teacher");
    return handleErrorResponse(new Error("Error updating teacher"), 500);
  }
};

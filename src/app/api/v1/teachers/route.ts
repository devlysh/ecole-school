import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";
import { AccessTokenPayload, RoleName, TeacherFormValues } from "@/lib/types";
import { handleErrorResponse } from "@/lib/errorUtils";
import { UnauthorizedError } from "@/lib/errors";
import { UsersRepository } from "@domain/repositories/Users.repository";
import { EventInput } from "@fullcalendar/core/index.js";
import bcrypt from "bcrypt";

export const GET = async () => {
  try {
    const decodedToken = await verifyAccessToken();

    if (!decodedToken.roles.includes(RoleName.ADMIN)) {
      throw new UnauthorizedError("You are not authorized to fetch teachers");
    }

    const userRepository = new UsersRepository();
    const teachers = await userRepository.findTeachers();
    return Response.json(teachers, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return handleErrorResponse(err, 403);
    }
    logger.error(err, "Error fetching teachers");
    return handleErrorResponse(new Error("Error fetching teachers"), 500);
  }
};

export const POST = async (request: Request) => {
  try {
    const decodedToken: AccessTokenPayload = await verifyAccessToken();

    if (!decodedToken.roles.includes(RoleName.ADMIN)) {
      throw new UnauthorizedError("You are not authorized to add a teacher");
    }

    const { name, email, password, timeSlots } =
      (await request.json()) as TeacherFormValues & { timeSlots: EventInput[] };

    if (!name || !email || !password) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newTeacher = await new UsersRepository().createTeacher(
      name,
      email,
      passwordHash,
      timeSlots
    );

    return Response.json(newTeacher, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return handleErrorResponse(err, 403);
    }
    logger.error(err, "Error adding teacher");
    return handleErrorResponse(new Error("Error adding teacher"), 500);
  }
};

import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { AccessTokenPayload, RoleName, TeacherFormValues } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";
import { BadRequestError, UnauthorizedError } from "@/lib/errors";
import { handleErrorResponse } from "@/lib/errorUtils";
import { verifyAccessToken } from "@/lib/jwt";
import { UserRepository } from "@domain/repositories/User.repository";

export const GET = async (
  request: Request,
  { params }: { params: { email: string } }
) => {
  try {
    await verifyAccessToken();
    const userRepository = new UserRepository();
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

    const { name, timezone, timeSlots, vacations } =
      (await request.json()) as TeacherFormValues & {
        timeSlots: EventInput[];
        vacations: EventInput[];
      };

    if (!name || !timezone) {
      throw new BadRequestError();
    }

    const updatedTeacher = await prisma.user.update({
      where: { email: params.email },
      data: {
        name: `${name}`,
        settings: { timezone },
        teacher: {
          update: {
            availableSlots: {
              deleteMany: {},
              create: timeSlots.map((slot) => ({
                startTime: slot.start as string,
                endTime: slot.end as string,
                rrule: slot.extendedProps?.rrule,
              })),
            },
            vacations: {
              deleteMany: {},
              create: vacations.map((slot) => ({
                date: new Date(slot.start as string).toISOString(),
              })),
            },
          },
        },
      },
    });

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

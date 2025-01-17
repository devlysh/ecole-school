import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";
import { AccessTokenPayload, Role, TeacherFormValues } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";

export const PUT = async (
  request: Request,
  { params }: { params: { email: string } }
) => {
  try {
    const decodedToken: AccessTokenPayload = await verifyAccessToken();
    if (!decodedToken || !decodedToken.roles.includes(Role.ADMIN)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, timezone, timeSlots, vacations } =
      (await request.json()) as TeacherFormValues & {
        timeSlots: EventInput[];
        vacations: EventInput[];
      };

    if (!name || !timezone) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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
    logger.error(err, "Error updating teacher");
    return Response.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
};

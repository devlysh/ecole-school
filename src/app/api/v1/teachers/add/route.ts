import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import {
  AccessTokenPayload,
  Role,
  TeacherFormWithTimeSlots,
} from "@/lib/types";
import bcrypt from "bcrypt";

export const POST = async (request: Request) => {
  try {
    const decodedToken: AccessTokenPayload = await verifyAccessToken();
    if (!decodedToken || !decodedToken.roles.includes(Role.ADMIN)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password, timezone, timeSlots } =
      (await request.json()) as TeacherFormWithTimeSlots;

    if (!name || !email || !password || !timezone) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newTeacher = await prisma.user.create({
      data: {
        name: `${name}`,
        email,
        passwordHash,
        settings: { timezone },
        teacher: {
          create: {
            availableSlots: {
              create: timeSlots.map((slot) => ({
                startTime: slot.start as string,
                endTime: slot.end as string,
                rrule: slot.rrule as string,
              })),
            },
          },
        },
        roles: {
          create: {
            role: {
              connect: {
                name: "teacher",
              },
            },
          },
        },
      },
    });

    return Response.json(newTeacher, { status: 201 });
  } catch (err: unknown) {
    logger.error(err, "Error adding teacher");
    return Response.json({ error: "Failed to add teacher" }, { status: 500 });
  }
};

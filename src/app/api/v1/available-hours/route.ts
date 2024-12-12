import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const selectedTime = url.searchParams.get("selectedTime");

    logger.debug({ selectedTime }, "Selected time");


    const availableHours = await prisma.availableHour.findMany({
      include: {
        teacher: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(availableHours, { status: 200 });
  } catch (err: unknown) {
    logger.error(err, "Error fetching available hours");
    return NextResponse.json(
      { error: "Failed to fetch available hours" },
      { status: 500 }
    );
  }
};

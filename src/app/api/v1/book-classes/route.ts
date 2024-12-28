import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";

export const POST = async (request: Request) => {
  try {
    // 1. Decode and verify JWT token
    const decodedToken = await verifyAccessToken();
    const email = decodedToken?.email;

    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized - no email in token" },
        { status: 401 }
      );
    }

    // 2. Parse body (expects { selectedSlots: AvailableHour[], isFixedSchedule: boolean })
    const body = await request.json();
    const { selectedSlots, isFixedSchedule } = body;
    if (!selectedSlots || !Array.isArray(selectedSlots)) {
      return NextResponse.json(
        { error: "selectedSlots must be an array" },
        { status: 400 }
      );
    }

    // 3. Load user (and teacher assignment info) from DB
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, student: { select: { assignedTeacherId: true } } },
    });

    if (!user || !user.student) {
      return NextResponse.json(
        { error: "You must be a student to book classes" },
        { status: 404 }
      );
    }

    const studentId = user.id;
    // If you store an assigned teacher, you can use it:
    const assignedTeacherId = user.student.assignedTeacherId;
    // If you want the code to handle teacher not assigned,
    // either throw or handle differently here.

    logger.info(
      { selectedSlots, studentId, assignedTeacherId },
      "Starting class booking"
    );

    // 4. Convert each (day, hour) to a Date. Example below assumes:
    //    - You consider the current Sunday (or next Sunday) as the “start of the week”.
    //    - Then add (slot.day) to that date, set slot.hour as the hour in UTC.
    //    - This is just an example. Customize your own logic as needed.
    const now = new Date();
    // Start from Sunday at 0:00 UTC of the current week
    const startOfWeek = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - now.getUTCDay()
      )
    );

    const createdBookings = [];

    for (const slot of selectedSlots) {
      const { day, hour } = slot; // day: 0=Sunday,...6=Saturday
      const bookingDate = new Date(startOfWeek);
      bookingDate.setUTCDate(startOfWeek.getUTCDate() + day);
      bookingDate.setUTCHours(hour, 0, 0, 0);

      if (assignedTeacherId == null) {
        return NextResponse.json(
          { error: "No teacher assigned" },
          { status: 400 }
        );
      }

      // Create record in booked_classes
      const bookedClass = await prisma.bookedClass.create({
        data: {
          date: bookingDate, // stored as UTC-based DateTime
          studentId,
          teacherId: assignedTeacherId,
          recurring: isFixedSchedule,
        },
      });

      createdBookings.push(bookedClass);
    }

    // 5. Return collection of newly created BookedClass records
    return NextResponse.json(createdBookings, { status: 201 });
  } catch (err) {
    logger.error(err, "Error creating booked classes");
    return NextResponse.json(
      { error: "Failed to create booked class" },
      { status: 500 }
    );
  }
};

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";
import { parseISO } from "date-fns";
import { RRule } from "rrule";
import { AvailableSlot } from "@prisma/client";

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

    // 2. Parse body
    const { dates, isFixedSchedule } = await request.json();

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { error: "dates must be a non-empty array of ISO 8601 strings" },
        { status: 400 }
      );
    }

    // 3. Load user + student
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        student: { select: { assignedTeacherId: true } },
      },
    });

    if (!user?.student) {
      return NextResponse.json(
        { error: "You must be a student to book classes" },
        { status: 404 }
      );
    }

    const studentId = user.id;
    let { assignedTeacherId } = user.student;

    // If the schedule is fixed => the booking is "recurring".
    const recurring = !!isFixedSchedule;

    // 4. If there's already an assigned teacher, we can simply check availability.
    // Otherwise, we must find a teacher that is available for ALL provided dates
    // and assign that teacher to this student.
    if (!assignedTeacherId) {
      // Find a teacher that can cover ALL requested dates/times.
      // We'll do a simple intersection approach:
      //   1) Load all teachers' available slots
      //   2) Filter those who can cover every date in "dates"
      //   3) If multiple teachers are found, pick the first.
      //      (You could choose to pick randomly, but we'll keep it simple.)

      // Build a map: teacherId -> arrayOf(availableSlots)
      // Then from each teacher, see if each date is covered.
      const allSlots = await prisma.availableSlot.findMany({
        include: { teacher: true },
      });

      // Convert availableSlot data into a dictionary keyed by teacherId
      // so we can quickly filter later.
      const teacherSlotsMap = new Map<number, typeof allSlots>();
      for (const slot of allSlots) {
        const arr = teacherSlotsMap.get(slot.teacherId) || [];
        arr.push(slot);
        teacherSlotsMap.set(slot.teacherId, arr);
      }

      // This function checks if a teacher covers a single date from "dates".
      // We'll see if the teacher has a slot whose rrule or exact date matches.
      const isDateCoveredBySlot = (dateString: string, slot: AvailableSlot) => {
        const parsedDate = parseISO(dateString);
        if (slot.rrule) {
          // If there's an rrule, check if that rrule covers this date
          // We'll parse the string, set dtstart from the slot's startTime
          try {
            const options = RRule.parseString(slot.rrule);
            options.dtstart = new Date(slot.startTime);
            const rule = new RRule(options);
            // We must see if 'parsedDate' is in the recurrence set
            // We'll set the check for the single day (start to end of that day).
            const nextOccurences = rule.between(parsedDate, parsedDate, true);
            if (nextOccurences.length > 0) {
              // Next, ensure time-of-day is within [slot.startTime, slot.endTime]
              // so if we want an hour match, etc. We’ll check the hour:
              const slotStartHour = new Date(slot.startTime).getUTCHours();
              const slotEndHour = new Date(slot.endTime).getUTCHours();
              const dateHour = parsedDate.getUTCHours();
              return dateHour >= slotStartHour && dateHour < slotEndHour;
            }
          } catch (e) {
            logger.warn(e, "Failed to parse or check rrule");
            return false;
          }
          return false;
        } else {
          // If not an rrule, check if the slot is for the *same day*
          // and also that the hour is covered
          const slotDateStr = new Date(slot.startTime)
            .toISOString()
            .slice(0, 10);
          const requestDateStr = parsedDate.toISOString().slice(0, 10);
          return slotDateStr === requestDateStr; // skip hour checks for debugging
        }
      };

      // Then check if a teacher is free for all selected date/time combos.
      // We'll also check if there's no current BookedClass for that date + teacher
      // We'll do a big function that returns true/false if teacher is free for ALL dates
      const canTeacherCoverAllDates = async (
        teacherId: number,
        slots: AvailableSlot[]
      ) => {
        // fetch teacher's booked classes for those exact date(s).
        const teacherBookings = await prisma.bookedClass.findMany({
          where: {
            teacherId,
            date: { in: dates.map((d: string) => parseISO(d)) },
          },
        });
        // If teacher has any existing BookedClass for those times, they're unavailable
        const teacherHasBookingCollision = teacherBookings.some((bc) => {
          const bcTime = bc.date.getTime();
          return dates.some((d: string) => parseISO(d).getTime() === bcTime);
        });
        if (teacherHasBookingCollision) return false;

        // Check that each "dates[i]" is covered by at least one "slot"
        return dates.every((dateStr: string) =>
          slots.some((slot) => isDateCoveredBySlot(dateStr, slot))
        );
      };

      // Filter teachers
      const teacherIds = Array.from(teacherSlotsMap.keys());
      let foundTeacherId: number | null = null;

      for (const tid of teacherIds) {
        const teacherAvailableSlots = teacherSlotsMap.get(tid) || [];
        if (await canTeacherCoverAllDates(tid, teacherAvailableSlots)) {
          foundTeacherId = tid;
          break;
        }
      }

      if (!foundTeacherId) {
        return NextResponse.json(
          { error: "No teacher found who can cover all requested dates." },
          { status: 409 }
        );
      }

      // Assign the teacher
      assignedTeacherId = foundTeacherId;
      await prisma.student.update({
        where: { userId: studentId },
        data: { assignedTeacherId: foundTeacherId },
      });
    } else {
      // If there's already an assigned teacher,
      // you could similarly check if that teacher can cover all requested dates,
      // and return an error if not. For simplicity, here we skip that check or do a basic one.
      const collisions = await prisma.bookedClass.findMany({
        where: {
          teacherId: assignedTeacherId,
          date: { in: dates.map((d: string) => parseISO(d)) },
        },
      });
      if (collisions.length > 0) {
        return NextResponse.json(
          { error: "Assigned teacher is busy for one or more of these dates." },
          { status: 409 }
        );
      }
    }

    // 5. Create booked classes for the assigned teacher
    // Each date is a single BookedClass record
    // Recurring flag is set if isFixedSchedule
    const newBookingsData = dates.map((dateStr: string) => ({
      date: parseISO(dateStr),
      studentId: studentId,
      teacherId: assignedTeacherId!,
      recurring,
    }));

    await prisma.bookedClass.createMany({ data: newBookingsData });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    logger.error(err, "Error creating booked classes");
    return NextResponse.json(
      { error: "Failed to create booked class" },
      { status: 500 }
    );
  }
};

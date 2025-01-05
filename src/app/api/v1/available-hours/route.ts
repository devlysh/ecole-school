import { NextResponse } from "next/server";
import logger from "@/lib/logger";
import { RRule } from "rrule";
import prisma from "@/lib/prisma";
import { AvailableSlot, BookedClass } from "@prisma/client";

export const GET = async (request: Request) => {
  return handleGetAvailableHoursRequest(request);
};

/**
 * Extracted core handler for easier testing
 */
export async function handleGetAvailableHoursRequest(request: Request) {
  try {
    const parsedUrl = new URL(request.url);
    const startDateParam = parsedUrl.searchParams.get("startDate") ?? undefined;
    const endDateParam = parsedUrl.searchParams.get("endDate") ?? undefined;
    const selectedSlotsParam =
      parsedUrl.searchParams.get("selectedSlots") ?? undefined;
    const fixedScheduleParam =
      parsedUrl.searchParams.get("fixedSchedule") ?? undefined;

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Reuse the same logic as before, but in a separate function
    const hourSlots = await getAvailableSlots(
      startDateParam,
      endDateParam,
      selectedSlotsParam,
      fixedScheduleParam
    );

    return NextResponse.json(hourSlots, { status: 200 });
  } catch (err) {
    logger.error(err, "Error fetching available hours");
    return NextResponse.json(
      { error: "Failed to fetch available hours" },
      { status: 500 }
    );
  }
}

/**
 * Main logic to collect and build available slots
 */
export async function getAvailableSlots(
  startDateParam: string,
  endDateParam: string,
  selectedSlotsParam?: string,
  fixedScheduleParam?: string
) {
  const isFixedSchedule = fixedScheduleParam === "true";
  const selectedSlots = parseSelectedSlots(selectedSlotsParam);
  const { startDate, endDate } = parseDateRange(startDateParam, endDateParam);

  const bookedClasses = await fetchBookedClasses();
  const availableSlots = await fetchAvailableSlots(isFixedSchedule);

  logger.debug(
    {
      isFixedSchedule,
      selectedSlots,
      startDate,
      endDate,
      bookedClasses,
      availableSlots,
    },
    "DEBUG1"
  );

  const hourSlotsMap = buildHourSlotsMap(
    availableSlots,
    bookedClasses,
    startDate,
    endDate
  );

  const teacherIntersection = calculateTeacherIntersection(
    selectedSlots,
    hourSlotsMap
  );

  return buildHourSlots(hourSlotsMap, selectedSlots, teacherIntersection);
}

export function parseSelectedSlots(selectedSlotsParam?: string) {
  return selectedSlotsParam
    ? selectedSlotsParam.split(",").map((slot) => {
        const [day, hour] = slot.split("-");
        return { day: Number(day), hour: Number(hour) };
      })
    : [];
}

export function parseDateRange(startDateParam: string, endDateParam: string) {
  const startDate = new Date(startDateParam);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(endDateParam);
  endDate.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
}

export async function fetchBookedClasses() {
  return prisma.bookedClass.findMany({});
}

export async function fetchAvailableSlots(isFixedSchedule: boolean) {
  const availableSlots = await prisma.availableSlot.findMany();

  if (isFixedSchedule) {
    return filterFixedScheduleSlots(availableSlots);
  }

  return availableSlots;
}

export function filterFixedScheduleSlots(availableSlots: AvailableSlot[]) {
  return availableSlots.filter(
    (slot: AvailableSlot) => typeof slot.rrule === "string"
  );
}

export function buildHourSlotsMap(
  availableSlots: AvailableSlot[],
  bookedClasses: BookedClass[],
  startDate: Date,
  endDate: Date
) {
  const hourSlotsMap = new Map<string, Set<number>>();

  for (const availableSlot of availableSlots) {
    const dates = calculateSlotDates(availableSlot, startDate, endDate);
    const durationHours = calculateDurationHours(availableSlot);

    for (const date of dates) {
      for (let hourOffset = 0; hourOffset < durationHours; hourOffset++) {
        const hourCheck = new Date(date);
        hourCheck.setUTCHours(
          new Date(availableSlot.startTime).getUTCHours() + hourOffset,
          0,
          0,
          0
        );

        if (!isSlotBooked(bookedClasses, availableSlot, hourCheck)) {
          const day = hourCheck.getUTCDay();
          const hour = hourCheck.getUTCHours();
          const key = `${day}-${hour}`;

          if (!hourSlotsMap.has(key)) {
            hourSlotsMap.set(key, new Set());
          }
          hourSlotsMap.get(key)?.add(availableSlot.teacherId);
        }
      }
    }
  }

  return hourSlotsMap;
}

export function calculateSlotDates(
  availableSlot: AvailableSlot,
  startDate: Date,
  endDate: Date
) {
  let dates: Date[] = [];

  if (availableSlot.rrule) {
    try {
      const options = RRule.parseString(availableSlot.rrule);
      options.dtstart = new Date(availableSlot.startTime);
      const rrule = new RRule(options);
      dates = rrule.between(startDate, endDate, true);
      if (dates.length === 0) {
        logger.warn(
          `No dates generated for slot ${availableSlot.id} with rule: ${availableSlot.rrule}`
        );
      }
    } catch (err) {
      logger.warn(err, `Failed to parse RRULE for slot ${availableSlot.id}`);
      return [];
    }
  } else {
    const slotDate = new Date(availableSlot.startTime);
    slotDate.setUTCHours(0, 0, 0, 0);
    if (slotDate >= startDate && slotDate <= endDate) {
      dates = [slotDate];
    }
  }

  return dates;
}

export function calculateDurationHours(availableSlot: AvailableSlot) {
  const startTime = new Date(availableSlot.startTime);
  const endTime = new Date(availableSlot.endTime);
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
}

export function isSlotBooked(
  bookedClasses: BookedClass[],
  availableSlot: AvailableSlot,
  slotDateTime: Date
): boolean {
  return bookedClasses.some((booked) => {
    const bookedDate = new Date(booked.date);
    return (
      booked.teacherId === availableSlot.teacherId &&
      bookedDate.getUTCFullYear() === slotDateTime.getUTCFullYear() &&
      bookedDate.getUTCMonth() === slotDateTime.getUTCMonth() &&
      bookedDate.getUTCDate() === slotDateTime.getUTCDate() &&
      bookedDate.getUTCHours() === slotDateTime.getUTCHours()
    );
  });
}

export function calculateTeacherIntersection(
  selectedSlots: { day: number; hour: number }[],
  hourSlotsMap: Map<string, Set<number>>
) {
  let teacherIntersection: Set<number> | null = null;

  for (const slot of selectedSlots) {
    const key = `${slot.day}-${slot.hour}`;
    const teachers = hourSlotsMap.get(key);

    if (!teachers) {
      teacherIntersection = new Set();
      break;
    }

    if (teacherIntersection === null) {
      teacherIntersection = new Set<number>(teachers);
    } else {
      teacherIntersection = new Set<number>(
        Array.from(teacherIntersection as Set<number>).filter((tId) => teachers.has(tId))
      );
    }

    if (teacherIntersection.size === 0) {
      break;
    }
  }

  return teacherIntersection;
}

export function buildHourSlots(
  hourSlotsMap: Map<string, Set<number>>,
  selectedSlots: { day: number; hour: number }[],
  teacherIntersection: Set<number> | null
) {
  const hourSlots: { day: number; hour: number }[] = [];

  hourSlotsMap.forEach((teachers, key) => {
    const [day, hour] = key.split("-").map(Number);

    // If no teacherIntersection or it's empty, only push if no slots are selected
    if (!teacherIntersection || teacherIntersection.size === 0) {
      if (selectedSlots.length === 0) {
        hourSlots.push({ day, hour });
      }
    } else {
      // Merge intersection and current teachers
      const intersection = new Set(
        Array.from(teachers).filter((t) => teacherIntersection?.has(t))
      );
      if (intersection.size > 0) {
        hourSlots.push({ day, hour });
      }
    }
  });

  return { hourSlots };
}

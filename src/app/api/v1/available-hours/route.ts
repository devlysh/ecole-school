import { NextResponse } from "next/server";
import logger from "@/lib/logger";
import { RRule } from "rrule";
import prisma from "@/lib/prisma";
import { AvailableSlot, BookedClass } from "@prisma/client";

/**
 * Main GET handler for this route:
 * - It calls the internal function to handle the logic (handleGetAvailableHoursRequest).
 */
export const GET = async (request: Request) => {
  return handleGetAvailableHoursRequest(request);
};

/**
 * Core handler to process the GET request and return available hours.
 * This is extracted to make the logic easier to test and maintain.
 */
export const handleGetAvailableHoursRequest = async (
  request: Request
): Promise<NextResponse> => {
  try {
    // Extract search parameters (startDate, endDate, selectedSlots, fixedSchedule)
    const parsedUrl = new URL(request.url);
    const startDateParam = parsedUrl.searchParams.get("startDate") ?? undefined;
    const endDateParam = parsedUrl.searchParams.get("endDate") ?? undefined;
    const selectedSlotsParam =
      parsedUrl.searchParams.get("selectedSlots") ?? undefined;
    const fixedScheduleParam =
      parsedUrl.searchParams.get("fixedSchedule") ?? undefined;

    // Validate required parameters: both start and end dates are needed
    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Call the main logic to build the list of available hour slots
    const hourSlots = await getAvailableSlots(
      startDateParam,
      endDateParam,
      selectedSlotsParam,
      fixedScheduleParam
    );

    // Return the slots as JSON
    return NextResponse.json(hourSlots, { status: 200 });
  } catch (err) {
    // Log errors and return an error response
    logger.error(err, "Error fetching available hours");
    return NextResponse.json(
      { error: "Failed to fetch available hours" },
      { status: 500 }
    );
  }
};

/**
 * Main logic function that generates a list of available hour slots
 * based on:
 * - The input date range (startDate, endDate)
 * - Whether a fixed schedule is chosen
 * - Additional user-selected slots
 */
export const getAvailableSlots = async (
  startDateParam: string,
  endDateParam: string,
  selectedSlotsParam?: string,
  fixedScheduleParam?: string
): Promise<{ hourSlots: { day: number; hour: number }[] }> => {
  // Check if the user-only wants to see fixed-schedule slots
  const isFixedSchedule = fixedScheduleParam === "true";

  // Parse the user selected slots in a "day-hour" format
  const selectedSlots = parseSelectedSlots(selectedSlotsParam);

  // Parse and convert start/end date strings into Date objects
  const { startDate, endDate } = parseDateRange(startDateParam, endDateParam);

  // Retrieve all booked classes
  const bookedClasses = await fetchBookedClasses();

  // Fetch available slots; optionally filter them for fixed schedules
  const availableSlots = await fetchAvailableSlots(isFixedSchedule);

  // Build a mapping of "day-hour" => Set of teacherIds who are free
  const hourSlotsMap = buildHourSlotsMap(
    availableSlots,
    bookedClasses,
    startDate,
    endDate
  );

  // Determine if there is a teacher intersection across selected slots
  // (i.e., a teacher who can cover all selected time slots)
  const teacherIntersection = calculateTeacherIntersection(
    selectedSlots,
    hourSlotsMap
  );

  logger.debug({ teacherIntersection }, "DEBUG: teacherIntersection");

  // Build and return the final list of hour slots
  return buildHourSlots(hourSlotsMap, selectedSlots, teacherIntersection);
};

/**
 * Parse the selectedSlots string (e.g., "1-10,3-12") into an array of
 * { day: number; hour: number } objects.
 */
export const parseSelectedSlots = (
  selectedSlotsParam?: string
): { day: number; hour: number }[] => {
  // If no slots are passed, return an empty array
  // Otherwise, split by comma and parse "day-hour"
  return selectedSlotsParam
    ? selectedSlotsParam.split(",").map((slot) => {
        const [day, hour] = slot.split("-");
        return { day: Number(day), hour: Number(hour) };
      })
    : [];
};

/**
 * Converts the startDate and endDate query parameters into fully
 * qualified Date objects, setting them to cover entire days:
 * - startDate at 00:00:00
 * - endDate at 23:59:59
 */
export const parseDateRange = (
  startDateParam: string,
  endDateParam: string
): { startDate: Date; endDate: Date } => {
  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  // Check if the dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid start or end date");
  }

  // Check if the end date is before the start date
  if (endDate < startDate) {
    throw new Error("End date cannot be before start date");
  }

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
};

/**
 * Fetches all booked classes from the database.
 * (These represent times that are already occupied/booked.)
 */
export const fetchBookedClasses = async (): Promise<BookedClass[]> => {
  return prisma.bookedClass.findMany({});
};

/**
 * Fetches all available slots from the database.
 * If isFixedSchedule is true, filters out any slots that do not have an RRULE.
 */
export const fetchAvailableSlots = async (
  isFixedSchedule: boolean
): Promise<AvailableSlot[]> => {
  const availableSlots = await prisma.availableSlot.findMany();

  if (isFixedSchedule) {
    return filterFixedScheduleSlots(availableSlots);
  }

  return availableSlots;
};

/**
 * Filter available slots to only those with an RRULE string,
 * denoting a recurring (fixed) schedule.
 */
export const filterFixedScheduleSlots = (
  availableSlots: AvailableSlot[]
): AvailableSlot[] => {
  return availableSlots.filter(
    (slot: AvailableSlot) => typeof slot.rrule === "string"
  );
};

/**
 * Build a Map that indicates which teachers are available at "day-hour" combos.
 * - For each available slot, compute the days it covers within the provided range.
 * - For each day computed, break down the slot by hour, marking the teacher as available.
 * - Also skip hours that are already booked (using isSlotBooked).
 */
export const buildHourSlotsMap = (
  availableSlots: AvailableSlot[],
  bookedClasses: BookedClass[],
  startDate: Date,
  endDate: Date
): Map<string, Set<number>> => {
  const hourSlotsMap = new Map<string, Set<number>>();

  // For each available slot, figure out which specific days are valid
  for (const availableSlot of availableSlots) {
    const dates = calculateSlotDates(availableSlot, startDate, endDate);
    const durationHours = calculateDurationHours(availableSlot);

    // For each day, break up the available hours in that day
    for (const date of dates) {
      for (let hourOffset = 0; hourOffset < durationHours; hourOffset++) {
        const hourCheck = new Date(date);

        // We add hourOffset to the original start time
        hourCheck.setUTCHours(
          new Date(availableSlot.startTime).getUTCHours() + hourOffset,
          0,
          0,
          0
        );

        // If the slot is not booked, record the teacher in the map
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
};

/**
 * Determine the specific dates that an availableSlot covers between startDate and endDate.
 * - If slot.rrule is present, we parse the RRULE and get the relevant dates in that range.
 * - Otherwise, we check if the single date of the slot is within the range.
 */
export const calculateSlotDates = (
  availableSlot: AvailableSlot,
  startDate: Date,
  endDate: Date
): Date[] => {
  let dates: Date[] = [];

  if (availableSlot.rrule) {
    try {
      const options = RRule.parseString(availableSlot.rrule);
      // Set the start time from availableSlot
      options.dtstart = new Date(availableSlot.startTime);
      const rrule = new RRule(options);

      // Get all occurrences within the given range
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
    // If there's no RRULE, we treat it as a single event slot
    const slotDate = new Date(availableSlot.startTime);
    slotDate.setUTCHours(0, 0, 0, 0);
    if (slotDate >= startDate && slotDate <= endDate) {
      dates = [slotDate];
    }
  }

  return dates;
};

/**
 * Computes the duration in hours of the slot by subtracting the start from the end time.
 */
export const calculateDurationHours = (
  availableSlot: AvailableSlot
): number => {
  const startTime = new Date(availableSlot.startTime);
  const endTime = new Date(availableSlot.endTime);
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
};

/**
 * Checks if a specific date/hour is already booked, matching the same teacher
 * and date/time in the array of BookedClass objects.
 */
export const isSlotBooked = (
  bookedClasses: BookedClass[],
  availableSlot: AvailableSlot,
  slotDateTime: Date
): boolean => {
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
};

/**
 * Given an array of user-selected "day-hour" combos and the hourSlotsMap,
 * this function computes which teachers (if any) are common to all selections.
 * - If no teacher is available for at least one selection, the intersection is empty.
 */
export const calculateTeacherIntersection = (
  selectedSlots: { day: number; hour: number }[],
  hourSlotsMap: Map<string, Set<number>>
): Set<number> | null => {
  let teacherIntersection: Set<number> | null = null;

  for (const slot of selectedSlots) {
    const key = `${slot.day}-${slot.hour}`;
    const teachers = hourSlotsMap.get(key);

    // If there's no teacher for this specific day-hour, intersection fails
    if (!teachers) {
      teacherIntersection = new Set();
      break;
    }

    // If this is our first intersection test (teacherIntersection === null),
    // we just copy the set of teachers available
    if (teacherIntersection === null) {
      teacherIntersection = new Set<number>(teachers);
    } else {
      // Otherwise, we refine the intersection by removing teachers not in the current set
      teacherIntersection = new Set<number>(
        Array.from(teacherIntersection as Set<number>).filter((tId) => teachers.has(tId))
      );
    }

    // If intersection is empty, we can stop
    if (teacherIntersection.size === 0) {
      break;
    }
  }

  return teacherIntersection;
};

/**
 * Builds the final list of hour slots for the response.
 * - If the user has not selected any slots OR there's no teacher intersection,
 *   we only list free slots if no slots are selected at all.
 * - If there is a teacher intersection, we ensure those teachers are present in each day-hour.
 */
export const buildHourSlots = (
  hourSlotsMap: Map<string, Set<number>>,
  selectedSlots: { day: number; hour: number }[],
  teacherIntersection: Set<number> | null
): { hourSlots: { day: number; hour: number }[] } => {
  const hourSlots: { day: number; hour: number }[] = [];

  hourSlotsMap.forEach((teachers, key) => {
    const [day, hour] = key.split("-").map(Number);

    // If no teacherIntersection or it's empty, only push the slot if no user slots are chosen
    if (!teacherIntersection || teacherIntersection.size === 0) {
      if (selectedSlots.length === 0) {
        hourSlots.push({ day, hour });
      }
    } else {
      // Otherwise, confirm that at least one teacher is present in the intersection
      const intersection = new Set(
        Array.from(teachers).filter((t) => teacherIntersection?.has(t))
      );

      if (intersection.size > 0) {
        hourSlots.push({ day, hour });
      }
    }
  });

  return { hourSlots };
};

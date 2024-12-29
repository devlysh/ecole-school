import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { RRule } from "rrule";

export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const selectedSlotsParam = url.searchParams.get("selectedSlots");
    const fixedScheduleParam = url.searchParams.get("fixedSchedule");

    const isFixedSchedule: boolean = fixedScheduleParam === "true";

    const selectedSlots = selectedSlotsParam
      ? selectedSlotsParam.split(",").map((slot) => {
          const [day, hour] = slot.split("-");
          return { day: Number(day), hour: Number(hour) };
        })
      : [];

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(endDateParam);
    endDate.setUTCHours(23, 59, 59, 999);

    let availableSlots = await prisma.availableSlot.findMany({});

    if (isFixedSchedule) {
      availableSlots = availableSlots.filter(
        (slot) => typeof slot.rrule === "string"
      );
    }

    const hourSlotsMap = new Map<string, Set<number>>();

    for (const availableSlot of availableSlots) {
      let rrule: RRule | undefined;
      let dates: Date[] = [];

      if (availableSlot.rrule) {
        const options = RRule.parseString(availableSlot.rrule);
        options.dtstart = new Date(availableSlot.startTime);
        rrule = new RRule(options);
        dates = rrule.between(startDate, endDate, true);
        if (dates.length === 0) {
          logger.warn(
            `No dates generated for slot ${availableSlot.id} with rule: ${availableSlot.rrule}`
          );
        }
      } else {
        const slotDate = new Date(availableSlot.startTime);
        slotDate.setUTCHours(0, 0, 0, 0);
        if (slotDate >= startDate && slotDate <= endDate) {
          dates = [slotDate];
        }
      }

      const startTime = new Date(availableSlot.startTime);
      const endTime = new Date(availableSlot.endTime);
      const durationHours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      for (const date of dates) {
        const day = date.getUTCDay();
        for (let hourOffset = 0; hourOffset < durationHours; hourOffset++) {
          const hour = (startTime.getUTCHours() + hourOffset) % 24;
          const key = `${day}-${hour}`;
          if (!hourSlotsMap.has(key)) {
            hourSlotsMap.set(key, new Set());
          }
          hourSlotsMap.get(key)?.add(availableSlot.teacherId);
        }
      }
    }

    let teacherIntersection: Set<number> | null = null;
    for (const slot of selectedSlots) {
      const key = `${slot.day}-${slot.hour}`;
      const teachers = hourSlotsMap.get(key);
      if (!teachers) {
        teacherIntersection = new Set();
        break;
      }
      if (teacherIntersection === null) {
        teacherIntersection = new Set(teachers);
      } else {
        const newIntersection = new Set<number>();
        teacherIntersection.forEach((tId) => {
          if (teachers.has(tId)) {
            newIntersection.add(tId);
          }
        });
        teacherIntersection = newIntersection;
      }
      if (teacherIntersection.size === 0) {
        break;
      }
    }

    const hourSlots: { day: number; hour: number }[] = [];
    hourSlotsMap.forEach((teachers, key) => {
      const [day, hour] = key.split("-").map(Number);
      if (!teacherIntersection || teacherIntersection.size === 0) {
        if (selectedSlots.length === 0) {
          hourSlots.push({ day, hour });
        }
      } else {
        const intersection = new Set(
          Array.from(teachers).filter((t) => teacherIntersection?.has(t))
        );
        if (intersection.size > 0) {
          hourSlots.push({ day, hour });
        }
      }
    });

    return NextResponse.json(hourSlots, { status: 200 });
  } catch (err) {
    logger.error(err, "Error fetching available hours");
    return NextResponse.json(
      { error: "Failed to fetch available hours" },
      { status: 500 }
    );
  }
};

import { RRule } from "rrule";
import logger from "@/lib/logger";
import { AvailableHoursRepository } from "./AvailableHoursRepository";
import { BookedClassRepository } from "./BookedClassRepository";
import { AvailableSlot, BookedClass } from "@prisma/client";

interface GetAvailableHoursParams {
  startDateParam: string;
  endDateParam: string;
  selectedSlotsParam?: string;
  fixedScheduleParam?: string;
}

export class AvailableHoursService {
  private availableHoursRepo: AvailableHoursRepository;
  private bookedClassRepo: BookedClassRepository;

  constructor(
    availableHoursRepo?: AvailableHoursRepository,
    bookedClassRepo?: BookedClassRepository
  ) {
    this.availableHoursRepo =
      availableHoursRepo || new AvailableHoursRepository();
    this.bookedClassRepo = bookedClassRepo || new BookedClassRepository();
  }

  public async getAvailableHours(params: GetAvailableHoursParams) {
    const {
      startDateParam,
      endDateParam,
      selectedSlotsParam,
      fixedScheduleParam,
    } = params;

    // 1) Validate and parse
    const { startDate, endDate } = this.parseDateRange(
      startDateParam,
      endDateParam
    );
    const selectedSlots = this.parseSelectedSlots(selectedSlotsParam);
    const isFixedSchedule = fixedScheduleParam === "true";

    // 2) Fetch data
    const bookedClasses = await this.bookedClassRepo.fetchAll();
    let availableSlots = await this.availableHoursRepo.fetchAll();
    if (isFixedSchedule) {
      availableSlots = availableSlots.filter(
        (slot) => slot.rrule && slot.rrule.trim().length > 0
      );
    }

    // 3) Build the hourSlots map
    const hourSlotsMap = this.buildHourSlotsMap(
      availableSlots,
      bookedClasses,
      startDate,
      endDate
    );

    // 4) Calculate teacher intersection if user selected specific slots
    const teacherIntersection = this.calculateTeacherIntersection(
      selectedSlots,
      hourSlotsMap
    );

    logger.debug(
      { teacherIntersection },
      "AvailableHoursService.getAvailableHours"
    );

    // 5) Build final list
    return this.buildHourSlots(
      hourSlotsMap,
      selectedSlots,
      teacherIntersection
    );
  }

  // --------------------- Utility Methods ---------------------

  private parseSelectedSlots(param?: string): { day: number; hour: number }[] {
    if (!param) return [];
    return param.split(",").map((slot) => {
      const [day, hour] = slot.split("-");
      return { day: Number(day), hour: Number(hour) };
    });
  }

  private parseDateRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid start or end date");
    }
    if (endDate < startDate) {
      throw new Error("End date cannot be before start date");
    }

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  private buildHourSlotsMap(
    availableSlots: AvailableSlot[],
    bookedClasses: BookedClass[],
    startDate: Date,
    endDate: Date
  ): Map<string, Set<number>> {
    const map = new Map<string, Set<number>>();

    for (const slot of availableSlots) {
      const validDates = this.calculateSlotDates(slot, startDate, endDate);
      const durationHours = this.calculateDurationHours(slot);

      for (const date of validDates) {
        for (let hourOffset = 0; hourOffset < durationHours; hourOffset++) {
          const hourCheck = new Date(date);
          hourCheck.setUTCHours(
            new Date(slot.startTime).getUTCHours() + hourOffset,
            0,
            0,
            0
          );

          if (!this.isSlotBooked(bookedClasses, slot, hourCheck)) {
            const day = hourCheck.getUTCDay();
            const hour = hourCheck.getUTCHours();
            const key = `${day}-${hour}`;

            if (!map.has(key)) {
              map.set(key, new Set<number>());
            }
            map.get(key)?.add(slot.teacherId);
          }
        }
      }
    }

    return map;
  }

  private calculateSlotDates(
    slot: AvailableSlot,
    startDate: Date,
    endDate: Date
  ): Date[] {
    if (!slot.rrule) {
      const single = new Date(slot.startTime);
      return single >= startDate && single <= endDate ? [single] : [];
    }

    try {
      const options = RRule.parseString(slot.rrule);
      options.dtstart = new Date(slot.startTime);
      const rrule = new RRule(options);
      return rrule.between(startDate, endDate, true);
    } catch (error) {
      logger.warn(error, `Failed to parse RRULE for slot: ${slot.id}`);
      return [];
    }
  }

  private calculateDurationHours(slot: AvailableSlot): number {
    const start = new Date(slot.startTime).getTime();
    const end = new Date(slot.endTime).getTime();
    let hours = (end - start) / (1000 * 60 * 60);
    if (hours < 0) {
      hours = 0;
    }
    return Math.floor(hours);
  }

  private isSlotBooked(
    bookedClasses: BookedClass[],
    slot: AvailableSlot,
    slotDateTime: Date
  ): boolean {
    return bookedClasses.some((booked) => {
      const bookedDate = new Date(booked.date);
      return (
        booked.teacherId === slot.teacherId &&
        bookedDate.getUTCFullYear() === slotDateTime.getUTCFullYear() &&
        bookedDate.getUTCMonth() === slotDateTime.getUTCMonth() &&
        bookedDate.getUTCDate() === slotDateTime.getUTCDate() &&
        bookedDate.getUTCHours() === slotDateTime.getUTCHours()
      );
    });
  }

  private calculateTeacherIntersection(
    selectedSlots: { day: number; hour: number }[],
    hourSlotsMap: Map<string, Set<number>>
  ): Set<number> | null {
    if (selectedSlots.length === 0) return null;
    let intersection: Set<number> | null = null;

    for (const { day, hour } of selectedSlots) {
      const key = `${day}-${hour}`;
      const teachers = hourSlotsMap.get(key);

      if (!teachers) {
        return new Set(); // no teacher can cover this slot
      }

      if (intersection === null) {
        intersection = new Set(teachers);
      } else {
        intersection = new Set(
          [...intersection].filter((t) => teachers.has(t))
        );
      }
      if (intersection.size === 0) break;
    }

    return intersection;
  }

  private buildHourSlots(
    hourSlotsMap: Map<string, Set<number>>,
    selectedSlots: { day: number; hour: number }[],
    teacherIntersection: Set<number> | null
  ): { hourSlots: { day: number; hour: number }[] } {
    const results: { day: number; hour: number }[] = [];

    hourSlotsMap.forEach((teachers, key) => {
      const [day, hour] = key.split("-").map(Number);
      if (!teacherIntersection || teacherIntersection.size === 0) {
        // If no teachers or intersection is empty, show all free hours only if no user slots are selected
        if (selectedSlots.length === 0) {
          results.push({ day, hour });
        }
      } else {
        // Show hours covered by at least one teacher in the intersection
        const intersection = [...teachers].filter((t) =>
          teacherIntersection.has(t)
        );
        if (intersection.length > 0) {
          results.push({ day, hour });
        }
      }
    });

    return { hourSlots: results };
  }
}

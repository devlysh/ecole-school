import { BookedClass } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";
import logger from "@/lib/logger";
import { RRule } from "rrule";

export class IsSlotBookedStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, dateTime, bookedClasses } = context;
    if (!slot || !dateTime || !bookedClasses) {
      return false;
    }

    const checkBooking = (bookedClass: BookedClass, date: Date) => {
      const isRecurrent = bookedClass.recurring;
      const isSameTime = bookedClass.date.getTime() === date.getTime();
      const isSameTeacher = bookedClass.teacherId === slot.teacherId;
      const isRecurrentMatch =
        isRecurrent && this.isRecurrentMatch(bookedClass, date);
      return (isSameTime || isRecurrentMatch) && isSameTeacher;
    };

    if (slot.rrule) {
      try {
        const rule = new RRule({
          ...RRule.parseString(slot.rrule),
          dtstart: slot.startTime,
        });
        const occurrences = rule.between(
          new Date(dateTime.getTime() - 1),
          new Date(dateTime.getTime() + 1),
          true
        );

        const isBooked = bookedClasses.some((bookedClass) =>
          occurrences.some((date) => checkBooking(bookedClass, date))
        );

        return !isBooked;
      } catch (err) {
        // handle the invalid rrule case
        logger.warn({ err, slot, dateTime }, "Invalid rrule");
        return false;
      }
    } else {
      const isBooked = bookedClasses.some((bookedClass) =>
        checkBooking(bookedClass, dateTime)
      );
      return !isBooked;
    }
  }

  private isRecurrentMatch(bookedClass: BookedClass, dateTime: Date): boolean {
    // Implement logic to check if the dateTime matches the recurrence pattern of the booked class
    // For example, check if the day of the week matches
    return bookedClass.date.getDay() === dateTime.getDay();
  }
}

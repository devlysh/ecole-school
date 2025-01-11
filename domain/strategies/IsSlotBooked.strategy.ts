import { AvailableSlot, BookedClass } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";
import logger from "@/lib/logger";
import { RRule } from "rrule";

export class IsSlotBookedStrategy implements SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, dateTime, bookedClasses } = context;
    if (!slot || !dateTime || !bookedClasses) {
      return false;
    }

    if (slot.rrule) {
      return this.isAvailableWithRRule(slot, dateTime, bookedClasses);
    } else {
      return this.isAvailableWithoutRRule(slot, dateTime, bookedClasses);
    }
  }

  private isAvailableWithRRule(
    slot: AvailableSlot,
    dateTime: Date,
    bookedClasses: BookedClass[]
  ): boolean {
    if (!slot.rrule) {
      return false;
    }

    try {
      const rule = new RRule({
        ...RRule.parseString(slot.rrule),
        dtstart: slot.startTime,
      });

      const duration = slot.endTime.getTime() - slot.startTime.getTime();
      const searchStart = new Date(dateTime.getTime() - duration);
      const searchEnd = new Date(dateTime.getTime() + duration);
      const occurrences = rule.between(searchStart, searchEnd, true);

      const occurrenceMatch = occurrences.find(
        (occ) =>
          dateTime >= occ && dateTime < new Date(occ.getTime() + duration)
      );

      if (!occurrenceMatch) {
        return false;
      }

      return !this.isSlotBlocked(bookedClasses, slot, dateTime);
    } catch (err) {
      logger.warn({ err, slot, dateTime }, "Invalid rrule");
      return false;
    }
  }

  private isAvailableWithoutRRule(
    slot: AvailableSlot,
    dateTime: Date,
    bookedClasses: BookedClass[]
  ): boolean {
    if (dateTime < slot.startTime || dateTime >= slot.endTime) {
      return false;
    }
    return !this.isSlotBlocked(bookedClasses, slot, dateTime);
  }

  private isSlotBlocked(
    bookedClasses: BookedClass[],
    slot: AvailableSlot,
    dateTime: Date
  ): boolean {
    return bookedClasses.some((bookedClass) =>
      this.checkBooking(bookedClass, slot, dateTime)
    );
  }

  private checkBooking(
    bookedClass: BookedClass,
    slot: AvailableSlot,
    dateTime: Date
  ): boolean {
    if (bookedClass.teacherId !== slot.teacherId) {
      return false;
    }
    if (
      bookedClass.recurring &&
      this.isRecurrentMatch(bookedClass.date, dateTime)
    ) {
      return true;
    }
    return bookedClass.date.getTime() === dateTime.getTime();
  }

  private isRecurrentMatch(bookedDate: Date, requestedDate: Date): boolean {
    return (
      bookedDate.getUTCDay() === requestedDate.getUTCDay() &&
      bookedDate.getUTCHours() === requestedDate.getUTCHours()
    );
  }
}

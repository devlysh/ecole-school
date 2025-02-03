import { AvailableSlot, BookedClass } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";
import logger from "@/lib/logger";

export class IsSlotBookedStrategy implements SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, dateTime, bookedClasses, isRecurrentSchedule } = context;

    if (!slot || !dateTime || !bookedClasses) {
      logger.warn("Missing context in IsSlotBookedStrategy");
      return true;
    }

    return !this.isBooked(bookedClasses, slot, dateTime, isRecurrentSchedule);
  }

  private isBooked(
    bookedClasses: BookedClass[],
    slot: AvailableSlot,
    dateTime: Date,
    isRecurrentSchedule?: boolean
  ): boolean {
    return bookedClasses.some((bookedClass) => {
      const isSameTeacher = bookedClass.teacherId === slot.teacherId;
      const isDateMatch = bookedClass.date.getTime() === dateTime.getTime();
      const isRecurrentMatch = this.isRecurrentMatch(
        bookedClass.date,
        dateTime
      );

      return (
        isSameTeacher &&
        (isDateMatch ||
          (bookedClass.recurring && isRecurrentMatch) ||
          (isRecurrentSchedule && isRecurrentMatch))
      );
    });
  }

  private isRecurrentMatch(bookedDate: Date, requestedDate: Date): boolean {
    return (
      bookedDate.getUTCDay() === requestedDate.getUTCDay() &&
      bookedDate.getUTCHours() === requestedDate.getUTCHours()
    );
  }
}

import { AvailableSlot, BookedClass } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class IsSlotBookedStrategy implements SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, dateTime, bookedClasses } = context;
    if (!slot || !dateTime || !bookedClasses) {
      return false;
    }

    return !this.isBooked(bookedClasses, slot, dateTime);
  }

  private isBooked(
    bookedClasses: BookedClass[],
    slot: AvailableSlot,
    dateTime: Date
  ): boolean {
    return bookedClasses.some((bookedClass) => {
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
    });
  }

  private isRecurrentMatch(bookedDate: Date, requestedDate: Date): boolean {
    return (
      bookedDate.getUTCDay() === requestedDate.getUTCDay() &&
      bookedDate.getUTCHours() === requestedDate.getUTCHours()
    );
  }
}

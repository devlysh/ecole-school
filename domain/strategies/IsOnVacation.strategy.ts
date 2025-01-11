import { AvailableSlot } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class IsOnVacationStrategy implements SlotAvailibilityStrategy {
  constructor(
    private vacations: { teacherId: number; start: Date; end: Date }[],
    private availableSlots: AvailableSlot[]
  ) {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { dateTime } = context;

    if (!dateTime) {
      return false;
    }

    return !this.vacations.some((vacation) =>
      this.availableSlots.some(
        (slot) =>
          vacation.teacherId === slot.teacherId &&
          vacation.start <= dateTime &&
          vacation.end >= dateTime
      )
    );
  }
}

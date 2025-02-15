import logger from "@/lib/logger";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class VacationStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { dateTime, slot, vacations } = context;

    if (!dateTime || !slot || !vacations) {
      logger.warn("Missing context in VacationStrategy");
      return true;
    }

    const allDay = new Date(dateTime.toISOString().split("T")[0]);

    return !vacations.some((vacation) => {
      if (
        vacation.date.toISOString() === allDay.toISOString() &&
        vacation.teacherId === slot.teacherId
      ) {
        return true;
      }
      return false;
    });
  }
}

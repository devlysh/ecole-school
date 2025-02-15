import logger from "@/lib/logger";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class TeachersSlotStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, exTeacherIds } = context;

    if (!slot) {
      logger.warn("Slot is missing from context in TeachersSlotStrategy");
      return false;
    }

    if (!exTeacherIds || !exTeacherIds.length) {
      return true;
    }

    if (exTeacherIds.includes(slot.teacherId)) {
      return false;
    }

    return true;
  }
}

import logger from "@/lib/logger";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class IsExTeachersSlotStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, exTeacherIds } = context;

    if (!slot) {
      logger.warn("Slot is missing from context in IsExTeachersSlotStrategy");
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

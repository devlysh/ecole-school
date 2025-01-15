import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";
import logger from "@/lib/logger";

export class HandleSelectedSlotsStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, selectedTeacherIds } = context;

    if (!slot || !selectedTeacherIds) {
      logger.warn("Missing context in HandleSelectedSlotsStrategy");
      return true;
    }

    if (selectedTeacherIds.size === 0) {
      return true;
    }

    return selectedTeacherIds.has(slot.teacherId);
  }
}

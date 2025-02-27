import logger from "@/lib/logger";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class AssignedTeacherStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, assignedTeacherId } = context;

    if (!slot) {
      logger.warn("Missing context in AssignedTeacherStrategy");
      return true;
    }

    if (!assignedTeacherId) {
      return true;
    }

    return slot.teacherId === assignedTeacherId;
  }
}

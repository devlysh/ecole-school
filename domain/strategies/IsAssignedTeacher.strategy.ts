import logger from "@/lib/logger";
import { AvailableSlot } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class IsAssignedTeacherStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, assignedTeacherId } = context;

    if (!slot) {
      logger.warn("Missing context in IsAssignedTeacherStrategy");
      return true;
    }

    if (!assignedTeacherId) {
      return true;
    }

    return slot.teacherId === assignedTeacherId;
  }
}

import logger from "@/lib/logger";
import { AvailableSlot } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class IsAssignedTeacherStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, student } = context;

    if (!slot || !student) {
      return false;
    }

    return slot.teacherId === student.assignedTeacherId;
  }
}

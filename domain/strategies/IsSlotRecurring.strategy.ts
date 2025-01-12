import { RRule } from "rrule";
import logger from "@/lib/logger";
import { AvailableSlot } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";

export class IsSlotRecurringStrategy implements SlotAvailibilityStrategy {
  constructor() {}
  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, isRecurrentSchedule } = context;

    if (!slot) {
      logger.warn("Missing context in IsSlotRecurringStrategy");
      return true;
    }

    if (isRecurrentSchedule && typeof slot.rrule !== "string") {
      return false;
    }

    if (!slot.rrule) {
      return true;
    }

    try {
      RRule.fromString(slot.rrule);
      return true;
    } catch (error) {
      logger.error(error, "Invalid rrule format");
      return false;
    }
  }
}

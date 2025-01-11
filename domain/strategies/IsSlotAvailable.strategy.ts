import { RRule } from "rrule";
import {
  SlotAvailibilityStrategy,
  SlotAvailibilityContext,
} from "./SlotAvailibilityStrategy.interface";
import logger from "@/lib/logger";
import { AvailableSlot } from "@prisma/client";

export class IsSlotAvailableStrategy implements SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, dateTime } = context;

    if (!slot || !dateTime) {
      return false;
    }

    let checkAvailibility;
    if (slot.rrule) {
      checkAvailibility = IsSlotAvailableStrategy.isRecurringSlotAvailable;
    } else {
      checkAvailibility = IsSlotAvailableStrategy.isNonRecurringSlotAvailable;
    }

    return checkAvailibility(slot, dateTime);
  }

  public static isRecurringSlotAvailable(
    slot: AvailableSlot,
    dateTime: Date
  ): boolean {
    if (!slot.rrule) {
      return false;
    }

    try {
      // Parse the RRULE and attach the base dtstart
      const rule = new RRule({
        ...RRule.parseString(slot.rrule),
        dtstart: slot.startTime,
      });

      // Calculate how long this slot lasts
      const duration = slot.endTime.getTime() - slot.startTime.getTime();

      // Find the occurrence at or before dateTime (inclusive)
      const occurrenceStart = rule.before(dateTime, true);
      if (!occurrenceStart) {
        // No occurrence found at or before dateTime
        return false;
      }

      // Check if dateTime still falls within the slot's duration
      const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
      return occurrenceStart <= dateTime && dateTime < occurrenceEnd;
    } catch (err) {
      // Handle invalid RRULE strings
      logger.warn({ err, slot }, "Invalid rrule");
      return false;
    }
  }

  public static isNonRecurringSlotAvailable(
    slot: AvailableSlot,
    dateTime: Date
  ): boolean {
    return slot.startTime <= dateTime && slot.endTime > dateTime;
  }
}

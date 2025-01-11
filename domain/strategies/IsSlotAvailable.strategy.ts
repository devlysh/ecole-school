import { RRule } from "rrule";
import {
  SlotAvailibilityStrategy,
  SlotAvailibilityContext,
} from "./SlotAvailibilityStrategy.interface";
import logger from "@/lib/logger";

export class IsSlotAvailableStrategy implements SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, dateTime } = context;

    if (!slot || !dateTime) {
      return false;
    }

    if (slot.rrule) {
      try {
        const rule = new RRule({
          ...RRule.parseString(slot.rrule),
          dtstart: slot.startTime,
        });
        const occurrences = rule.between(
          new Date(dateTime.getTime() - 1),
          new Date(dateTime.getTime() + 1),
          true
        );
        return occurrences.some(
          (date) => date.getTime() === dateTime.getTime()
        );
      } catch (err) {
        // handle the invalid rrule case
        logger.warn({ err, slot }, "Invalid rrule");
        return false;
      }
    } else {
      return slot.startTime <= dateTime && slot.endTime > dateTime;
    }
  }
}

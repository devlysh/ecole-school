import { AvailableSlot } from "@prisma/client";
import {
  SlotAvailibilityContext,
  SlotAvailibilityStrategy,
} from "./SlotAvailibilityStrategy.interface";
import { IsSlotAvailableStrategy } from "./IsSlotAvailable.strategy";
import logger from "@/lib/logger";

export class HandleSelectedSlotsStrategy implements SlotAvailibilityStrategy {
  constructor() {}

  isAvailable(context: SlotAvailibilityContext): boolean {
    const { slot, selectedSlots, lockedTeacherIds } = context;

    if (!slot || !lockedTeacherIds) {
      return false;
    }

    if (!selectedSlots || selectedSlots.length === 0) {
      return true;
    }

    for (const selectedSlot of selectedSlots) {
      if (this.isSlotAvailable(slot, selectedSlot)) {
        lockedTeacherIds.add(slot.teacherId);
        break;
      }
    }

    return lockedTeacherIds.has(slot.teacherId);
  }

  private isSlotAvailable(slot: AvailableSlot, dateTime: Date): boolean {
    return slot.rrule
      ? IsSlotAvailableStrategy.isRecurringSlotAvailable(slot, dateTime)
      : IsSlotAvailableStrategy.isNonRecurringSlotAvailable(slot, dateTime);
  }
}

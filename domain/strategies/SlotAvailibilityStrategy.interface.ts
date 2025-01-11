import { AvailableSlot, BookedClass } from "@prisma/client";

export interface SlotAvailibilityContext {
  dateTime?: Date;
  slot?: AvailableSlot;
  assignedTeacherId?: number;
  bookedClasses?: BookedClass[];
  selectedSlots?: Date[];
  lockedTeacherIds?: Set<number>;
}

export interface SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean;
}

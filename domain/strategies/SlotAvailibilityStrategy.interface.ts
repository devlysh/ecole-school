import { AvailableSlot, BookedClass, Vacation } from "@prisma/client";

export interface SlotAvailibilityContext {
  dateTime?: Date;
  slot?: AvailableSlot;
  assignedTeacherId?: number;
  bookedClasses?: BookedClass[];
  selectedSlots?: Date[];
  lockedTeacherIds?: Set<number>;
  vacations?: Vacation[];
}

export interface SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean;
}

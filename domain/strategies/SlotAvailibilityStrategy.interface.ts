import { AvailableSlot, BookedClass, Student } from "@prisma/client";

export interface SlotAvailibilityContext {
  dateTime?: Date;
  slot?: AvailableSlot;
  teacherId?: number;
  bookedClasses?: BookedClass[];
}

export interface SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean;
}

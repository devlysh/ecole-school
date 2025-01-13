import { AvailableSlot, BookedClass, Vacation } from "@prisma/client";

export interface SlotAvailibilityContext {
  dateTime?: Date;
  slot?: AvailableSlot;
  assignedTeacherId?: number;
  bookedClasses?: BookedClass[];
  selectedSlots?: Date[];
  selectedTeacherIds?: Set<number>;
  vacations?: Vacation[];
  isRecurrentSchedule?: boolean;
}

export interface SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean;
}

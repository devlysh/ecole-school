import { AvailableSlot, BookedClass, Language, Vacation } from "@prisma/client";

export interface SlotAvailibilityContext {
  dateTime?: Date;
  slot?: AvailableSlot;
  assignedTeacherId?: number;
  bookedClasses?: BookedClass[];
  selectedSlots?: Date[];
  selectedTeacherIds?: Set<number>;
  vacations?: Vacation[];
  isRecurrentSchedule?: boolean;
  exTeacherIds?: number[];
  teachersLanguages?: Map<number, Language[]>;
  studentLanguages?: Language[];
}

export interface SlotAvailibilityStrategy {
  isAvailable(context: SlotAvailibilityContext): boolean;
}

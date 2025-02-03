import prisma from "@/lib/prisma";
import { AvailableSlot } from "@prisma/client";

export class AvailableSlotsRepository {
  findAll(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({});
  }

  findByTeacherId(teacherId: number): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        teacherId: teacherId,
      },
    });
  }

  findRecurringSlots(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        rrule: {
          not: null,
        },
      },
    });
  }

  findRecurringByTeacherId(teacherId: number): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        teacherId: teacherId,
        rrule: {
          not: null,
        },
      },
    });
  }
}

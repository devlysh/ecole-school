import prisma from "@/lib/prisma";
import { AvailableSlot } from "@prisma/client";

export class AvailableSlotsRepository {
  public async fetchAll(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({});
  }

  public async fetchByTeacherId(teacherId: number): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        teacherId: teacherId,
      },
    });
  }

  public async fetchRecurringSlots(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        rrule: {
          not: null,
        },
      },
    });
  }

  public async fetchRecurringByTeacherId(
    teacherId: number
  ): Promise<AvailableSlot[]> {
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

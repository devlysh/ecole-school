import prisma from "@/lib/prisma";
import { AvailableSlot } from "@prisma/client";

export class AvailableSlotsRepository {
  public async findAll(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({});
  }

  public async findByTeacherId(teacherId: number): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        teacherId: teacherId,
      },
    });
  }

  public async findRecurringSlots(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        rrule: {
          not: null,
        },
      },
    });
  }

  public async findRecurringByTeacherId(
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

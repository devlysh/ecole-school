import prisma from "@/lib/prisma";
import { AvailableSlot } from "@prisma/client";

export class AvailableHoursRepository {
  public async fetchAll(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({});
  }

  public async fetchFixedScheduleSlots(): Promise<AvailableSlot[]> {
    return prisma.availableSlot.findMany({
      where: {
        rrule: {
          not: null,
        },
      },
    });
  }
}

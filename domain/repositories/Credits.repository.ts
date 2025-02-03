import prisma from "@/lib/prisma";
import { Credit } from "@prisma/client";

export class CreditsRepository {
  create(studentId: number): Promise<Credit> {
    return prisma.credit.create({
      data: {
        studentId,
        addedAt: new Date(),
      },
    });
  }

  getActiveCount(studentId: number): Promise<number> {
    return prisma.credit.count({
      where: {
        studentId,
        usedAt: null,
        usedWithBookedClassId: null,
      },
    });
  }

  findFirstUnused(studentId: number): Promise<Credit | null> {
    return prisma.credit.findFirst({
      where: {
        studentId,
        usedAt: null,
      },
      orderBy: {
        addedAt: "asc",
      },
    });
  }

  markAsUsed(creditId: number, bookedClass: number): Promise<Credit> {
    return prisma.credit.update({
      where: {
        id: creditId,
      },
      data: {
        usedAt: new Date(),
        usedWithBookedClassId: bookedClass,
      },
    });
  }
}

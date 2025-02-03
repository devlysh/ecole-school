import prisma from "@/lib/prisma";
import { Credit } from "@prisma/client";

export class CreditsRepository {
  public async create(studentId: number): Promise<Credit> {
    return await prisma.credit.create({
      data: {
        studentId,
        addedAt: new Date(),
      },
    });
  }

  public async getActiveCount(studentId: number): Promise<number> {
    return prisma.credit.count({
      where: {
        studentId,
        usedAt: null,
        usedWithBookedClassId: null,
      },
    });
  }

  public async findFirstUnused(studentId: number): Promise<Credit | null> {
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

  public async markAsUsed(
    creditId: number,
    bookedClass: number
  ): Promise<Credit> {
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

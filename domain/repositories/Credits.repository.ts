import prisma from "@/lib/prisma";
import { Credit } from "@prisma/client";

export class CreditsRepository {
  public async createCredits(studentId: number): Promise<Credit> {
    return await prisma.credit.create({
      data: {
        studentId,
        addedAt: new Date(),
      },
    });
  }

  public async getActiveCreditsCount(studentId: number): Promise<number> {
    return prisma.credit.count({
      where: {
        studentId,
        usedAt: null,
        usedWithBookedClassId: null,
      },
    });
  }

  public async findFirstUnusedCredit(
    studentId: number
  ): Promise<Credit | null> {
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

  public async markCreditAsUsed(
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

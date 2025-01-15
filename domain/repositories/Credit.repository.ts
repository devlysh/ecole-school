import prisma from "@/lib/prisma";
import { Credit } from "@prisma/client";

export class CreditRepository {
  public async addCredits(
    studentId: number,
    amount: number
  ): Promise<Credit[]> {
    const credits = [];
    for (let i = 0; i < amount; i++) {
      const credit = await prisma.credit.create({
        data: {
          studentId,
          createdAt: new Date(),
        },
      });
      credits.push(credit);
    }
    return credits;
  }

  public async useCredit(
    studentId: number,
    bookedClass: number
  ): Promise<Credit> {
    const credit = await prisma.credit.findFirst({
      where: {
        studentId,
        usedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!credit) {
      throw new Error("No unused credits available");
    }

    return prisma.credit.update({
      where: {
        id: credit.id,
      },
      data: {
        usedAt: new Date(),
        usedWithBookedClassId: bookedClass,
      },
    });
  }
}

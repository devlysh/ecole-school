import { CreditsRepository } from "@domain/repositories/Credits.repository";
import { Credit } from "@prisma/client";

export class CreditService {
  constructor(private readonly creditRepository: CreditsRepository) {}

  public async addCredits(
    studentId: number,
    amount: number
  ): Promise<Credit[]> {
    const credits = [];
    for (let i = 0; i < amount; i++) {
      const credit = await this.creditRepository.create(studentId);
      credits.push(credit);
    }
    return credits;
  }

  public async useCredit(
    studentId: number,
    bookedClass: number
  ): Promise<Credit> {
    const credit = await this.creditRepository.findFirstUnused(studentId);
    if (!credit) {
      throw new Error("No unused credits available");
    }
    return await this.creditRepository.markAsUsed(credit.id, bookedClass);
  }

  public async getActiveCreditsCount(studentId: number): Promise<number> {
    return await this.creditRepository.getActiveCount(studentId);
  }
}

import { CreditsRepository } from "@domain/repositories/Credits.repository";
import { Credit } from "@prisma/client";

export class CreditsService {
  private creditsRepo: CreditsRepository;

  constructor(creditRepository = new CreditsRepository()) {
    this.creditsRepo = creditRepository;
  }

  public async addCredits(
    studentId: number,
    amount: number
  ): Promise<Credit[]> {
    const credits = [];
    for (let i = 0; i < amount; i++) {
      const credit = await this.creditsRepo.create(studentId);
      credits.push(credit);
    }
    return credits;
  }

  public async deductCredit(
    studentId: number,
    bookedClass: number
  ): Promise<Credit> {
    const credit = await this.creditsRepo.findFirstUnused(studentId);
    if (!credit) {
      throw new Error("No unused credits available");
    }
    return await this.creditsRepo.markAsUsed(credit.id, bookedClass);
  }

  public async getActiveCreditsCount(studentId: number): Promise<number> {
    return await this.creditsRepo.getActiveCount(studentId);
  }
}

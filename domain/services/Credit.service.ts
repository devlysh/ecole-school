import { CreditRepository } from "@domain/repositories/Credit.repository";
import { Credit } from "@prisma/client";

export class CreditService {
  constructor(private readonly creditRepository: CreditRepository) {}

  public async addCredits(
    studentId: number,
    amount: number
  ): Promise<Credit[]> {
    return this.creditRepository.addCredits(studentId, amount);
  }

  public async useCredit(
    studentId: number,
    bookedClass: number
  ): Promise<Credit> {
    return this.creditRepository.useCredit(studentId, bookedClass);
  }

  public async getActiveCreditsCount(studentId: number): Promise<number> {
    return this.creditRepository.getActiveCreditsCount(studentId);
  }
}

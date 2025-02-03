import prisma from "@/lib/prisma";

export class CurrenciesRepository {
  findAll() {
    return prisma.currency.findMany();
  }
}

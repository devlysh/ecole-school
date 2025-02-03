import prisma from "@/lib/prisma";
import { Currency } from "@prisma/client";

export class CurrenciesRepository {
  findAll(): Promise<Currency[]> {
    return prisma.currency.findMany({});
  }
}

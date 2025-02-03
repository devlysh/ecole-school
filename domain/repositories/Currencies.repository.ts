export class CurrenciesRepository {
  findAll() {
    return prisma.currency.findMany();
  }
}

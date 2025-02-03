export class LanguagesRepository {
  findAll() {
    return prisma.language.findMany();
  }
}

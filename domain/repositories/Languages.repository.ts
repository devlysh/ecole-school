import prisma from "@/lib/prisma";

export class LanguagesRepository {
  findAll() {
    return prisma.language.findMany();
  }
}

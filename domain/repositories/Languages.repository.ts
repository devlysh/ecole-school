import prisma from "@/lib/prisma";
import { Language } from "@prisma/client";

export class LanguagesRepository {
  findAll(): Promise<Language[]> {
    return prisma.language.findMany({});
  }
}

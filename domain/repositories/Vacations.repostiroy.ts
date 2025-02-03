import prisma from "@/lib/prisma";
import { Vacation } from "@prisma/client";

export class VacationsRepository {
  findAll(): Promise<Vacation[]> {
    return prisma.vacation.findMany({});
  }
}

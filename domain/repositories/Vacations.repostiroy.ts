import prisma from "@/lib/prisma";
import { Vacation } from "@prisma/client";

export class VacationsRepository {
  fetchAllVacations(): Promise<Vacation[]> {
    return prisma.vacation.findMany({});
  }
}

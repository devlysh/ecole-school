import prisma from "@/lib/prisma";
import { parseISO } from "date-fns";
import { BookedClass, Vacation } from "@prisma/client";

export class VacationsRepository {
  fetchAllVacations(): Promise<Vacation[]> {
    return prisma.vacation.findMany({});
  }
}

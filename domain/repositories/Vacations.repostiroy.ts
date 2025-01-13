import prisma from "@/lib/prisma";
import { parseISO } from "date-fns";
import { BookedClass } from "@prisma/client";

export class VacationsRepository {
  fetchAllVacations() {
    return prisma.vacation.findMany({});
  }
}

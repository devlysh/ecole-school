import prisma from "@/lib/prisma";
import { BookedClass } from "@prisma/client";

export class BookedClassesRepository {
  async createBookedClasses(bookedClasses: Omit<BookedClass, "id">[]) {
    return prisma.bookedClass.createMany({ data: bookedClasses });
  }

  async fetchAllBookedClasses(): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({});
  }
}

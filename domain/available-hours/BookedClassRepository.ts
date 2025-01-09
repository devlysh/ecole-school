import prisma from "@/lib/prisma";
import { BookedClass } from "@prisma/client";

export class BookedClassRepository {
  public async fetchAll(): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({});
  }

  // Example of a specialized query:
  public async fetchForTeacher(teacherId: number): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({ where: { teacherId } });
  }
}

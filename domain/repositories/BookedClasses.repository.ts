import prisma from "@/lib/prisma";
import { BookedClass } from "@prisma/client";

export class BookedClassesRepository {
  async createBookedClasses(bookedClasses: Omit<BookedClass, "id">[]) {
    return prisma.bookedClass.createMany({ data: bookedClasses });
  }

  async fetchAllBookedClasses(): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({});
  }

  async fetchBookedClassById(id: number): Promise<BookedClass | null> {
    return prisma.bookedClass.findUnique({ where: { id } });
  }

  async fetchBookedClassesByStudentId(
    studentId: number
  ): Promise<Pick<BookedClass, "id" | "date" | "recurring">[]> {
    return prisma.bookedClass.findMany({
      where: { studentId: studentId, isActive: true },
      select: {
        id: true,
        date: true,
        recurring: true,
      },
    });
  }

  async deleteByIdAndStudentId(id: number, studentId: number) {
    return prisma.bookedClass.deleteMany({
      where: {
        id,
        studentId: studentId,
      },
    });
  }
}

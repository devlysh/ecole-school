import prisma from "@/lib/prisma";
import { StudentClass } from "@/lib/types";
import { BookedClass } from "@prisma/client";

export class BookedClassesRepository {
  async createBookedClasses(bookedClasses: Omit<BookedClass, "id">[]) {
    return prisma.bookedClass.createMany({ data: bookedClasses });
  }

  async findAllBookedClasses(): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({});
  }

  async findBookedClassById(id: number): Promise<BookedClass | null> {
    return prisma.bookedClass.findUnique({ where: { id } });
  }

  async findBookedClassesByStudentId(
    studentId: number
  ): Promise<StudentClass[]> {
    return prisma.bookedClass.findMany({
      where: { studentId: studentId },
      select: {
        id: true,
        date: true,
        recurring: true,
      },
    });
  }

  async findBookedClassesByTeacherId(
    teacherId: number
  ): Promise<Pick<BookedClass, "id" | "date" | "recurring" | "studentId">[]> {
    return prisma.bookedClass.findMany({
      where: { teacherId: teacherId },
      select: {
        id: true,
        date: true,
        recurring: true,
        studentId: true,
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

  async deleteAllBookedClassesByStudentId(studentId: number) {
    return prisma.bookedClass.deleteMany({
      where: { studentId: studentId },
    });
  }
}

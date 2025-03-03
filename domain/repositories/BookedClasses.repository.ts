import prisma from "@/lib/prisma";
import { StudentClass } from "@/lib/types";
import { BookedClass } from "@prisma/client";

export class BookedClassesRepository {
  create(data: Omit<BookedClass, "id">[]) {
    return prisma.bookedClass.createMany({ data });
  }

  findAll(): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({});
  }

  findById(id: number): Promise<BookedClass | null> {
    return prisma.bookedClass.findUnique({ where: { id } });
  }

  findByStudentId(studentId: number): Promise<StudentClass[]> {
    return prisma.bookedClass.findMany({
      where: { studentId: studentId },
      select: {
        id: true,
        date: true,
        createdAt: true,
        recurring: true,
      },
    });
  }

  findByTeacherId(
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

  deleteById(id: number) {
    return prisma.bookedClass.delete({
      where: {
        id,
      },
    });
  }

  deleteAllByStudentId(studentId: number) {
    return prisma.bookedClass.deleteMany({
      where: { studentId: studentId },
    });
  }
}

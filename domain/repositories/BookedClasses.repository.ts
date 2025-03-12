import prisma from "@/lib/prisma";
import { DisplayBookedClass } from "@/lib/types";
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

  findByStudentId(studentId: number): Promise<DisplayBookedClass[]> {
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
  ): Promise<(DisplayBookedClass & { studentId: number })[]> {
    return prisma.bookedClass.findMany({
      where: { teacherId: teacherId },
      select: {
        id: true,
        date: true,
        createdAt: true,
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

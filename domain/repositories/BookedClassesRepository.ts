import prisma from "@/lib/prisma";
import { parseISO } from "date-fns";
import { BookedClass } from "@prisma/client";

export class BookedClassesRepository {
  async findTeacherBookings(teacherId: number, dates: string[]) {
    return prisma.bookedClass.findMany({
      where: {
        teacherId,
        date: { in: dates.map((d) => parseISO(d)) },
      },
    });
  }

  async createBookedClasses(newBookingsData: any[]) {
    return prisma.bookedClass.createMany({ data: newBookingsData });
  }

  async fetchAllBookedClasses(): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({});
  }

  async fetchBookedClassesForTeacher(
    teacherId: number
  ): Promise<BookedClass[]> {
    return prisma.bookedClass.findMany({ where: { teacherId } });
  }
}

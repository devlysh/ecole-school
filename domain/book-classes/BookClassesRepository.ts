import prisma from "@/lib/prisma";
import { parseISO } from "date-fns";

export const BookClassesRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        student: { select: { assignedTeacherId: true } },
      },
    });
  },

  async findAvailableSlots() {
    return prisma.availableSlot.findMany({
      include: { teacher: true },
    });
  },

  async findTeacherBookings(teacherId: number, dates: string[]) {
    return prisma.bookedClass.findMany({
      where: {
        teacherId,
        date: { in: dates.map((d) => parseISO(d)) },
      },
    });
  },

  async updateStudentAssignedTeacher(studentId: number, teacherId: number) {
    return prisma.student.update({
      where: { userId: studentId },
      data: { assignedTeacherId: teacherId },
    });
  },

  async createBookedClasses(newBookingsData: any[]) {
    return prisma.bookedClass.createMany({ data: newBookingsData });
  },
}; 
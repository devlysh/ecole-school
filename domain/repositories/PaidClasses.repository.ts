import prisma from "@/lib/prisma";
import { PaidClass } from "@prisma/client";

export class PaidClassesRepository {
  constructor() {}

  create(studentId: number, teacherId: number): Promise<PaidClass> {
    return prisma.paidClass.create({
      data: {
        date: new Date(),
        studentId,
        teacherId,
      },
    });
  }

  findAll(): Promise<PaidClass[]> {
    return prisma.paidClass.findMany({});
  }

  findByStudentId(studentId: number): Promise<PaidClass[]> {
    return prisma.paidClass.findMany({ where: { studentId } });
  }

  findByTeacherId(teacherId: number): Promise<PaidClass[]> {
    return prisma.paidClass.findMany({ where: { teacherId } });
  }

  findByDateRange(startDate: Date, endDate: Date): Promise<PaidClass[]> {
    return prisma.paidClass.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });
  }

  findByStudentIdAndDateRange(
    studentId: number,
    startDate: Date,
    endDate: Date
  ): Promise<PaidClass[]> {
    return prisma.paidClass.findMany({
      where: { studentId, date: { gte: startDate, lte: endDate } },
    });
  }

  findByTeacherIdAndDateRange(
    teacherId: number,
    startDate: Date,
    endDate: Date
  ): Promise<PaidClass[]> {
    return prisma.paidClass.findMany({
      where: { teacherId, date: { gte: startDate, lte: endDate } },
    });
  }
}

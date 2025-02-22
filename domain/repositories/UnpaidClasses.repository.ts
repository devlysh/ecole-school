import prisma from "@/lib/prisma";
import { UnpaidClass } from "@prisma/client";

export class UnpaidClassesRepository {
  constructor() {}

  create(
    studentId: number,
    teacherId: number,
    date: Date
  ): Promise<UnpaidClass> {
    return prisma.unpaidClass.create({
      data: {
        date,
        studentId,
        teacherId,
      },
    });
  }

  findAll(): Promise<UnpaidClass[]> {
    return prisma.unpaidClass.findMany({});
  }

  findByStudentId(studentId: number): Promise<UnpaidClass[]> {
    return prisma.unpaidClass.findMany({ where: { studentId } });
  }

  findByTeacherId(teacherId: number): Promise<UnpaidClass[]> {
    return prisma.unpaidClass.findMany({ where: { teacherId } });
  }

  findByDateRange(startDate: Date, endDate: Date): Promise<UnpaidClass[]> {
    return prisma.unpaidClass.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });
  }

  findByStudentIdAndDateRange(
    studentId: number,
    startDate: Date,
    endDate: Date
  ): Promise<UnpaidClass[]> {
    return prisma.unpaidClass.findMany({
      where: { studentId, date: { gte: startDate, lte: endDate } },
    });
  }

  findByTeacherIdAndDateRange(
    teacherId: number,
    startDate: Date,
    endDate: Date
  ): Promise<UnpaidClass[]> {
    return prisma.unpaidClass.findMany({
      where: { teacherId, date: { gte: startDate, lte: endDate } },
    });
  }
}

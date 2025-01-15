import prisma from "@/lib/prisma";
import { Student, Teacher, User } from "@prisma/client";

export class UserRepository {
  public async findStudentByEmail(
    email: string
  ): Promise<(User & { student: Student | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
      },
    });
  }

  public async findTeacherByEmail(
    email: string
  ): Promise<(User & { teacher: Teacher | null }) | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: {
          include: {
            availableSlots: true,
            vacations: true,
          },
        },
      },
    });
  }
}

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

  public async updateName(id: number, name: string) {
    return await prisma.user.update({
      where: { id },
      data: { name },
    });
  }

  public async resetAssignedTeacher(userId: number, student: Student) {
    if (!student.assignedTeacherId) {
      throw new Error("User has no assigned teacher");
    }

    return await prisma.student.update({
      where: { userId },
      data: {
        assignedTeacherId: null,
        exTeacherIds: [...student.exTeacherIds, student.assignedTeacherId],
      },
    });
  }
}

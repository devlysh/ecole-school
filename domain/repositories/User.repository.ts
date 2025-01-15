import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export class UserRepository {
  public async findByEmail(email: string): Promise<{
    id: number;
    student: { assignedTeacherId: number | null } | null;
  } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        student: { select: { assignedTeacherId: true } },
      },
    });
  }

  public async findTeacherByEmail(email: string): Promise<User | null> {
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

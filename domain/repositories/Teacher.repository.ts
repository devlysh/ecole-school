import prisma from "@/lib/prisma";
import { Role } from "@/lib/types";
import { Teacher, User } from "@prisma/client";

/**
 * Example repository for getting all teachers from the DB.
 * Assumes you've got a Teacher model in your schema.
 */
export class TeacherRepository {
  public async findAllTeachers(): Promise<Teacher[]> {
    return prisma.teacher.findMany();
  }

  public async findTeacherById(userId: number): Promise<Teacher | null> {
    return prisma.teacher.findUnique({ where: { userId } });
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

  public async findTeachersWithRolesAndLanguages(): Promise<any[]> {
    return prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: Role.TEACHER,
            },
          },
        },
        teacher: {
          isNot: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        settings: true,
        teacher: {
          select: {
            languages: {
              select: {
                language: {
                  select: {
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
